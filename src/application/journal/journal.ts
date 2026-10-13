import { z } from 'zod';
import { hasCard } from '@/content';
import type { DrawnCard, JournalEntry, Reading } from '@/domain/records';
import type { Db } from '@/server/db/client';
import {
  deleteEntry,
  getEntry,
  insertEntry,
  listEntries,
  updateEntry,
} from '@/server/repositories/journal';
import {
  deleteReading,
  getReading,
  insertReading,
  listCards,
  listSpreadIds,
} from '@/server/repositories/readings';
import { resolveDeps, type Deps } from '../deps';
import { checkReading } from '../readings/checkReading';
import { fail, ok, type Result } from '../result';
import {
  BodySchema,
  JournalEntrySchema,
  PromptSchema,
  ReadingSchema,
  TagsSchema,
  TitleSchema,
} from './schemas';

/** An entry with the reading it belongs to (null for a free reflection). */
export interface JournalDetail {
  entry: JournalEntry;
  reading: Reading | null;
}

/** One row of the list: the entry, and what is needed to draw its notebook card. */
export interface JournalListItem {
  entry: JournalEntry;
  spreadId: string | null;
  /** The cards drawn, in position order; a reflection about a card lists just that card. */
  cards: Pick<DrawnCard, 'cardId' | 'orientation'>[];
}

export function getJournalEntry(db: Db, id: string): JournalDetail | null {
  const entry = getEntry(db, id);
  if (!entry) return null;
  return { entry, reading: entry.readingId ? getReading(db, entry.readingId) : null };
}

/** Every entry, newest first. Single user, a few thousand rows at most: no paging. */
export function listJournalEntries(db: Db): JournalListItem[] {
  const entries = listEntries(db);
  const readingIds = entries.flatMap((entry) => (entry.readingId ? [entry.readingId] : []));
  const cards = listCards(db, readingIds);
  const spreadOf = listSpreadIds(db, readingIds);
  return entries.map((entry) => ({
    entry,
    spreadId: entry.readingId ? (spreadOf.get(entry.readingId) ?? null) : null,
    cards: entry.readingId
      ? (cards.get(entry.readingId) ?? []).map(({ cardId, orientation }) => ({
          cardId,
          orientation,
        }))
      : entry.cardId
        ? [{ cardId: entry.cardId, orientation: 'upright' as const }]
        : [],
  }));
}

export const UpdateEntryInputSchema = z
  .object({ id: z.uuid(), title: TitleSchema, body: BodySchema, tags: TagsSchema })
  .strict();

/** Changes the title, note and tags of an entry, and when it was last changed; nothing else. */
export function updateJournalEntry(
  db: Db,
  input: unknown,
  deps: Partial<Deps> = {},
): Result<JournalEntry> {
  const parsed = UpdateEntryInputSchema.safeParse(input);
  if (!parsed.success) return fail('invalid-input', String(parsed.error.issues[0]?.path[0] ?? ''));
  const { id, ...edit } = parsed.data;
  const updated = updateEntry(db, id, edit, resolveDeps(deps).now());
  return updated ? ok(updated) : fail('not-found');
}

/** What a delete removed, kept by the page for a few seconds so the reader can undo it. */
export interface JournalSnapshot {
  entry: JournalEntry;
  reading: Reading | null;
}

/**
 * Deletes an entry. An entry with a reading takes the reading and its cards with it (the reading
 * only exists because it was saved); a free reflection just goes. One transaction.
 */
export function deleteJournalEntry(db: Db, id: string): Result<JournalSnapshot> {
  return db.transaction((tx) => {
    const entry = getEntry(tx, id);
    if (!entry) return fail('not-found');
    const reading = entry.readingId ? getReading(tx, entry.readingId) : null;
    if (reading)
      deleteReading(tx, reading.id); // cascades to the cards and to the entry
    else deleteEntry(tx, entry.id);
    return ok({ entry, reading });
  });
}

export const JournalSnapshotSchema = z
  .object({ entry: JournalEntrySchema, reading: ReadingSchema.nullable() })
  .strict();

/** Puts back what `deleteJournalEntry` removed, with the same ids. */
export function restoreJournalEntry(db: Db, input: unknown): Result<{ entryId: string }> {
  const parsed = JournalSnapshotSchema.safeParse(input);
  if (!parsed.success) return fail('invalid-input');
  const { entry, reading } = parsed.data;
  if ((entry.readingId ?? null) !== (reading?.id ?? null)) return fail('invalid-input');
  if (reading) {
    const problem = checkReading(reading, { strict: false });
    if (problem) return problem;
  }
  if (entry.cardId && !hasCard(entry.cardId)) return fail('unknown-card');

  db.transaction((tx) => {
    if (reading) insertReading(tx, reading, entry.createdAt);
    insertEntry(tx, entry);
  });
  return ok({ entryId: entry.id });
}

export const CreateReflectionInputSchema = z
  .object({
    title: TitleSchema,
    body: BodySchema.default(''),
    prompt: PromptSchema.nullable().default(null),
    tags: TagsSchema.default([]),
    cardId: z.string().min(1).max(64).nullable().default(null),
  })
  .strict();

/** A free reflection: a journal entry with no reading, optionally about one card. */
export function createReflection(
  db: Db,
  input: unknown,
  deps: Partial<Deps> = {},
): Result<{ entryId: string }> {
  const parsed = CreateReflectionInputSchema.safeParse(input);
  if (!parsed.success) return fail('invalid-input', String(parsed.error.issues[0]?.path[0] ?? ''));
  const { title, body, prompt, tags, cardId } = parsed.data;
  if (cardId !== null && !hasCard(cardId)) return fail('unknown-card');
  const { now, newId } = resolveDeps(deps);
  const at = now();
  const entry: JournalEntry = {
    id: newId(),
    readingId: null,
    cardId,
    title,
    body,
    prompt,
    tags,
    createdAt: at,
    updatedAt: at,
  };
  if (!insertEntry(db, entry)) throw new Error(`Could not write journal entry ${entry.id}`);
  return ok({ entryId: entry.id });
}
