import { hasCard } from '@/content';
import { getSpread, hasSpread } from '@/content/spreads';
import type { Reading } from '@/domain/records';
import { fail, type Failure } from '../result';

/**
 * Checks a reading against the content: the spread and every card must exist, no card may repeat.
 * `strict` (a reading being saved now) also demands the current version of the spread and one card
 * for every position, in order. An imported or restored reading may come from an older version of
 * a spread, so there it only has to be consistent with itself.
 */
export function checkReading(reading: Reading, { strict }: { strict: boolean }): Failure | null {
  if (!hasSpread(reading.spreadId)) return fail('unknown-spread');
  const spread = getSpread(reading.spreadId);

  const seen = new Set<string>();
  for (const card of reading.cards) {
    if (!hasCard(card.cardId)) return fail('unknown-card');
    if (seen.has(card.cardId)) return fail('duplicate-card');
    seen.add(card.cardId);
  }

  const inOrder = reading.cards.every((card, i) => card.positionIndex === i);
  if (!inOrder) return fail('spread-mismatch');
  if (reading.spreadVersion > spread.version) return fail('spread-mismatch');
  if (strict) {
    if (reading.spreadVersion !== spread.version) return fail('spread-mismatch');
    if (reading.cards.length !== spread.positions.length) return fail('spread-mismatch');
    const keysMatch = reading.cards.every(
      (card, i) => card.positionKey === spread.positions[i].key,
    );
    if (!keysMatch) return fail('spread-mismatch');
  }
  return null;
}
