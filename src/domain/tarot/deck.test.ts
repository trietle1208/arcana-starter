import { describe, expect, it } from 'vitest';
import {
  DECK_IDS,
  deckPosition,
  expectedCardId,
  expectedImagePath,
  minorCardId,
  romanNumeral,
} from './deck';

describe('deck', () => {
  it('lists 78 unique ids: major arcana first, then cups, wands, swords, pentacles', () => {
    expect(DECK_IDS).toHaveLength(78);
    expect(new Set(DECK_IDS).size).toBe(78);
    expect(DECK_IDS[0]).toBe('the-fool');
    expect(DECK_IDS[21]).toBe('the-world');
    expect(DECK_IDS[22]).toBe('cups-ace');
    expect(DECK_IDS[35]).toBe('cups-king');
    expect(DECK_IDS[36]).toBe('wands-ace');
    expect(DECK_IDS[77]).toBe('pentacles-king');
  });

  it('builds minor ids: ace, two-digit numbers, courts', () => {
    expect(minorCardId('cups', 1)).toBe('cups-ace');
    expect(minorCardId('cups', 2)).toBe('cups-02');
    expect(minorCardId('swords', 10)).toBe('swords-10');
    expect(minorCardId('wands', 'queen')).toBe('wands-queen');
  });

  it('derives the id and the image a card must have', () => {
    expect(expectedCardId({ arcana: 'major', number: 9 })).toBe('the-hermit');
    expect(expectedCardId({ arcana: 'major', number: 22 })).toBeUndefined();
    expect(expectedCardId({ arcana: 'minor', suit: 'cups', rank: 3 })).toBe('cups-03');
    expect(expectedImagePath({ arcana: 'major', number: 9, id: 'the-hermit' })).toBe(
      '/cards/09-the-hermit.webp',
    );
    expect(expectedImagePath({ arcana: 'minor', id: 'wands-ace' })).toBe('/cards/wands-ace.webp');
  });

  it('knows the position of a card in deck order', () => {
    expect(deckPosition('the-fool')).toBe(0);
    expect(deckPosition('cups-ace')).toBe(22);
    expect(deckPosition('nope')).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('writes Roman numerals, with 0 for The Fool', () => {
    expect([0, 1, 2, 4, 5, 6, 9, 10, 14, 19, 21].map((n) => romanNumeral(n))).toEqual([
      '0',
      'I',
      'II',
      'IV',
      'V',
      'VI',
      'IX',
      'X',
      'XIV',
      'XIX',
      'XXI',
    ]);
    expect(() => romanNumeral(-1)).toThrow(RangeError);
    expect(() => romanNumeral(1.5)).toThrow(RangeError);
  });
});
