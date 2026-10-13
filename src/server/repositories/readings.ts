import 'server-only';
import { asc, eq, inArray } from 'drizzle-orm';
import type { DrawnCard, Reading } from '@/domain/records';
import type { DbOrTx } from '@/server/db/client';
import { readingCards, readings } from '@/server/db/schema';

type CardRow = typeof readingCards.$inferSelect;
type ReadingRow = typeof readings.$inferSelect;

const toDrawnCard = (row: CardRow): DrawnCard => ({
  positionIndex: row.positionIndex,
  positionKey: row.positionKey,
  cardId: row.cardId,
  orientation: row.orientation,
});

const toReading = (row: ReadingRow, cards: DrawnCard[]): Reading => ({
  id: row.id,
  spreadId: row.spreadId,
  spreadVersion: row.spreadVersion,
  question: row.question,
  cards,
  drawnAt: new Date(row.drawnAt),
});

/**
 * Writes the reading and its cards. Returns false, writing nothing, when a reading with this id
 * is already stored (saving the same reading twice is harmless).
 */
export function insertReading(db: DbOrTx, reading: Reading, createdAt: Date): boolean {
  const { changes } = db
    .insert(readings)
    .values({
      id: reading.id,
      spreadId: reading.spreadId,
      spreadVersion: reading.spreadVersion,
      question: reading.question,
      drawnAt: reading.drawnAt.getTime(),
      createdAt: createdAt.getTime(),
    })
    .onConflictDoNothing()
    .run();
  if (changes === 0) return false;
  if (reading.cards.length > 0) {
    db.insert(readingCards)
      .values(reading.cards.map((card) => ({ readingId: reading.id, ...card })))
      .run();
  }
  return true;
}

export function getReading(db: DbOrTx, id: string): Reading | null {
  const row = db.select().from(readings).where(eq(readings.id, id)).get();
  if (!row) return null;
  return toReading(row, listCards(db, [id]).get(id) ?? []);
}

/** The cards of several readings at once, each list in position order. */
export function listCards(db: DbOrTx, readingIds: readonly string[]): Map<string, DrawnCard[]> {
  const byReading = new Map<string, DrawnCard[]>();
  if (readingIds.length === 0) return byReading;
  const rows = db
    .select()
    .from(readingCards)
    .where(inArray(readingCards.readingId, [...readingIds]))
    .orderBy(asc(readingCards.readingId), asc(readingCards.positionIndex))
    .all();
  for (const row of rows) {
    const list = byReading.get(row.readingId) ?? [];
    list.push(toDrawnCard(row));
    byReading.set(row.readingId, list);
  }
  return byReading;
}

/** The spread of each of several readings, by reading id. */
export function listSpreadIds(db: DbOrTx, readingIds: readonly string[]): Map<string, string> {
  if (readingIds.length === 0) return new Map();
  const rows = db
    .select({ id: readings.id, spreadId: readings.spreadId })
    .from(readings)
    .where(inArray(readings.id, [...readingIds]))
    .all();
  return new Map(rows.map((row) => [row.id, row.spreadId]));
}

/** A reading as stored: the reading, and when the row was written. */
export interface StoredReading {
  reading: Reading;
  createdAt: Date;
}

/** Every reading, with its cards (the JSON export). */
export function listReadings(db: DbOrTx): StoredReading[] {
  const rows = db.select().from(readings).orderBy(asc(readings.drawnAt), asc(readings.id)).all();
  const cards = listCards(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({
    reading: toReading(row, cards.get(row.id) ?? []),
    createdAt: new Date(row.createdAt),
  }));
}

export function readingExists(db: DbOrTx, id: string): boolean {
  return (
    db.select({ id: readings.id }).from(readings).where(eq(readings.id, id)).get() !== undefined
  );
}

/** Deleting a reading cascades to its cards and to the journal entry that belongs to it. */
export function deleteReading(db: DbOrTx, id: string): boolean {
  return db.delete(readings).where(eq(readings.id, id)).run().changes > 0;
}
