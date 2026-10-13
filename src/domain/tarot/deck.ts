import type { CardId, CourtRank, Suit } from './types';

/** Deck order for the minor arcana, as in the card files. */
export const SUITS: readonly Suit[] = ['cups', 'wands', 'swords', 'pentacles'];
export const COURT_RANKS: readonly CourtRank[] = ['page', 'knight', 'queen', 'king'];
/** Ace (1) … 10, then the four courts. */
export const MINOR_RANKS: readonly (number | CourtRank)[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  ...COURT_RANKS,
];

/** Ids of the 22 major arcana; the index is the card number. Ids are permanent. */
export const MAJOR_CARD_IDS: readonly CardId[] = [
  'the-fool',
  'the-magician',
  'the-high-priestess',
  'the-empress',
  'the-emperor',
  'the-hierophant',
  'the-lovers',
  'the-chariot',
  'strength',
  'the-hermit',
  'wheel-of-fortune',
  'justice',
  'the-hanged-man',
  'death',
  'temperance',
  'the-devil',
  'the-tower',
  'the-star',
  'the-moon',
  'the-sun',
  'judgement',
  'the-world',
];

/** 'cups-ace', 'cups-02' … 'cups-10', 'cups-page' … 'cups-king'. */
export function minorCardId(suit: Suit, rank: number | CourtRank): CardId {
  if (typeof rank === 'string') return `${suit}-${rank}`;
  if (rank === 1) return `${suit}-ace`;
  return `${suit}-${String(rank).padStart(2, '0')}`;
}

/** All 78 ids in deck order: major 0–21, then cups, wands, swords, pentacles. */
export const DECK_IDS: readonly CardId[] = [
  ...MAJOR_CARD_IDS,
  ...SUITS.flatMap((suit) => MINOR_RANKS.map((rank) => minorCardId(suit, rank))),
];

/** The id a card must have, derived from its number or its suit and rank. */
export function expectedCardId(
  card:
    { arcana: 'major'; number: number } | { arcana: 'minor'; suit: Suit; rank: number | CourtRank },
): CardId | undefined {
  return card.arcana === 'major' ? MAJOR_CARD_IDS[card.number] : minorCardId(card.suit, card.rank);
}

/** '/cards/09-the-hermit.webp' for major cards, '/cards/cups-03.webp' for minor ones. */
export function expectedImagePath(
  card: { arcana: 'major'; number: number; id: CardId } | { arcana: 'minor'; id: CardId },
): string {
  const file =
    card.arcana === 'major' ? `${String(card.number).padStart(2, '0')}-${card.id}` : card.id;
  return `/cards/${file}.webp`;
}

/** Position of a card in deck order; the "sort by number" order of the library. */
export function deckPosition(id: CardId): number {
  return DECK_ORDER.get(id) ?? Number.MAX_SAFE_INTEGER;
}
const DECK_ORDER: ReadonlyMap<CardId, number> = new Map(DECK_IDS.map((id, i) => [id, i]));

const ROMAN: readonly (readonly [number, string])[] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** 0 stays '0' (The Fool), 1–21 become Roman numerals. */
export function romanNumeral(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 39) throw new RangeError(`No numeral for ${n}`);
  if (n === 0) return '0';
  let rest = n;
  let out = '';
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}
