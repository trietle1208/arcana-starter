import 'server-only';
import { desc, eq } from 'drizzle-orm';
import type { JournalEntry } from '@/domain/records';
import type { DbOrTx } from '@/server/db/client';
import { journalEntries } from '@/server/db/schema';

type EntryRow = typeof journalEntries.$inferSelect;

/** Tags are a JSON column; a damaged value reads as no tags rather than breaking the page. */
function parseTags(text: string): string[] {
  try {
    const value: unknown = JSON.parse(text);
    return Array.isArray(value)
      ? value.filter((tag): tag is string => typeof tag === 'string')
      : [];
  } catch {
    return [];
  }
}

const toEntry = (row: EntryRow): JournalEntry => ({
  id: row.id,
  readingId: row.readingId,
  cardId: row.cardId,
  title: row.title,
  body: row.body,
  prompt: row.prompt,
  tags: parseTags(row.tags),
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

/**
 * Writes the entry. Returns false, writing nothing, when its id is taken or its reading already
 * has an entry.
 */
export function insertEntry(db: DbOrTx, entry: JournalEntry): boolean {
  return (
    db
      .insert(journalEntries)
      .values({
        id: entry.id,
        readingId: entry.readingId,
        cardId: entry.cardId,
        title: entry.title,
        body: entry.body,
        prompt: entry.prompt,
        tags: JSON.stringify(entry.tags),
        createdAt: entry.createdAt.getTime(),
        updatedAt: entry.updatedAt.getTime(),
      })
      .onConflictDoNothing()
      .run().changes > 0
  );
}

export function getEntry(db: DbOrTx, id: string): JournalEntry | null {
  const row = db.select().from(journalEntries).where(eq(journalEntries.id, id)).get();
  return row ? toEntry(row) : null;
}

export function getEntryByReadingId(db: DbOrTx, readingId: string): JournalEntry | null {
  const row = db.select().from(journalEntries).where(eq(journalEntries.readingId, readingId)).get();
  return row ? toEntry(row) : null;
}

/** Every entry, newest first. */
export function listEntries(db: DbOrTx): JournalEntry[] {
  return db
    .select()
    .from(journalEntries)
    .orderBy(desc(journalEntries.createdAt), desc(journalEntries.id))
    .all()
    .map(toEntry);
}

export interface EntryEdit {
  title: string;
  body: string;
  tags: string[];
}

/** Changes the title, note and tags, and when it happened; nothing else. */
export function updateEntry(
  db: DbOrTx,
  id: string,
  edit: EntryEdit,
  now: Date,
): JournalEntry | null {
  const row = db
    .update(journalEntries)
    .set({
      title: edit.title,
      body: edit.body,
      tags: JSON.stringify(edit.tags),
      updatedAt: now.getTime(),
    })
    .where(eq(journalEntries.id, id))
    .returning()
    .get();
  return row ? toEntry(row) : null;
}

export function deleteEntry(db: DbOrTx, id: string): boolean {
  return db.delete(journalEntries).where(eq(journalEntries.id, id)).run().changes > 0;
}
