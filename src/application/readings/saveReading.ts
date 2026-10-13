import { z } from 'zod';
import type { JournalEntry } from '@/domain/records';
import type { Db } from '@/server/db/client';
import { getEntryByReadingId, insertEntry } from '@/server/repositories/journal';
import { insertReading } from '@/server/repositories/readings';
import { resolveDeps, type Deps } from '../deps';
import {
  BodySchema,
  PromptSchema,
  ReadingSchema,
  TagsSchema,
  TitleSchema,
} from '../journal/schemas';
import { fail, ok, type Result } from '../result';
import { checkReading } from './checkReading';

export const SaveReadingInputSchema = z
  .object({
    reading: ReadingSchema,
    title: TitleSchema,
    body: BodySchema.default(''),
    prompt: PromptSchema.nullable().default(null),
    tags: TagsSchema.default([]),
  })
  .strict();

export interface SavedReading {
  entryId: string;
  readingId: string;
  /** False when this reading had been saved before: nothing was written again. */
  created: boolean;
}

/**
 * Saves a drawn reading to the journal: the reading, its cards and its journal entry, in one
 * transaction. Ids are checked against the content first. Saving the same reading twice (a double
 * click) returns the first entry.
 */
export function saveReading(
  db: Db,
  input: unknown,
  deps: Partial<Deps> = {},
): Result<SavedReading> {
  const parsed = SaveReadingInputSchema.safeParse(input);
  if (!parsed.success) return fail('invalid-input', String(parsed.error.issues[0]?.path[0] ?? ''));
  const { reading, title, body, prompt, tags } = parsed.data;
  const problem = checkReading(reading, { strict: true });
  if (problem) return problem;

  const { now, newId } = resolveDeps(deps);
  return db.transaction((tx) => {
    const savedAt = now();
    if (!insertReading(tx, reading, savedAt)) {
      const existing = getEntryByReadingId(tx, reading.id);
      if (existing) return ok({ entryId: existing.id, readingId: reading.id, created: false });
    }
    const entry: JournalEntry = {
      id: newId(),
      readingId: reading.id,
      cardId: null,
      title,
      body,
      prompt,
      tags,
      createdAt: savedAt,
      updatedAt: savedAt,
    };
    // A taken id cannot happen with random uuids; failing here rolls the reading back with it.
    if (!insertEntry(tx, entry)) throw new Error(`Could not write journal entry ${entry.id}`);
    return ok({ entryId: entry.id, readingId: reading.id, created: true });
  });
}
