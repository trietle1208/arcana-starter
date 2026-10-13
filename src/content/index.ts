import { DECK_IDS, expectedCardId, expectedImagePath } from '@/domain/tarot/deck';
import type { CardId, TarotCard } from '@/domain/tarot/types';
import cups from './cards/cups.json';
import major from './cards/major.json';
import pentacles from './cards/pentacles.json';
import swords from './cards/swords.json';
import wands from './cards/wands.json';
import { CardFileSchema } from './schema';

// Parsed once when the module loads. A malformed card file fails the build and the tests with a
// message that names the card, instead of surfacing as a broken page later.
const FILES = { major, cups, wands, swords, pentacles };

function parseFile(name: string, data: unknown): TarotCard[] {
  const result = CardFileSchema.safeParse(data);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid card file "${name}.json": ${problems.slice(0, 5).join('; ')}`);
  }
  return result.data;
}

function buildDeck(): TarotCard[] {
  const byId = new Map<CardId, TarotCard>();
  for (const [name, data] of Object.entries(FILES)) {
    for (const card of parseFile(name, data)) {
      if (byId.has(card.id)) throw new Error(`Duplicate card id "${card.id}" in ${name}.json`);
      if (card.id !== expectedCardId(card)) {
        throw new Error(`Card "${card.id}" in ${name}.json does not match its number or rank`);
      }
      if (card.image !== expectedImagePath(card)) {
        throw new Error(`Card "${card.id}" has image "${card.image}", expected its own file`);
      }
      byId.set(card.id, card);
    }
  }
  const missing = DECK_IDS.filter((id) => !byId.has(id));
  if (missing.length > 0 || byId.size !== DECK_IDS.length) {
    throw new Error(`Expected ${DECK_IDS.length} cards; missing: ${missing.join(', ') || 'none'}`);
  }
  return DECK_IDS.map((id) => byId.get(id)!);
}

/** All 78 cards in deck order: major 0–21, then cups, wands, swords, pentacles. */
export const ALL_CARDS: readonly TarotCard[] = buildDeck();
export const ALL_CARD_IDS: readonly CardId[] = ALL_CARDS.map((card) => card.id);

const BY_ID: ReadonlyMap<CardId, TarotCard> = new Map(ALL_CARDS.map((card) => [card.id, card]));

export function hasCard(id: string): boolean {
  return BY_ID.has(id);
}

/** Throws on an unknown id: ids are permanent, so a miss is a bug or corrupt data. */
export function getCard(id: CardId): TarotCard {
  const card = BY_ID.get(id);
  if (!card) throw new Error(`Unknown card id "${id}"`);
  return card;
}

export { SPREADS, SPREAD_IDS, getSpread, hasSpread } from './spreads';
