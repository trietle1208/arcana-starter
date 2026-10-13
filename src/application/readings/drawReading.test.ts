import { describe, expect, it } from 'vitest';
import { ALL_CARD_IDS, getCard, getSpread } from '@/content';
import { seededRng } from '@/domain/random';
import { DECK_IDS } from '@/domain/tarot/deck';
import { drawReading } from './drawReading';
import { getReadingCards, toReadingCard } from './readingCards';

const FIXED = {
  newId: () => 'reading-1',
  now: () => new Date('2026-10-13T08:00:00.000Z'),
};

describe('drawReading', () => {
  it('draws a reading for the spread with the id, version and time it was given', () => {
    const reading = drawReading(
      'three-card',
      { includeReversed: true },
      { ...FIXED, rng: seededRng(5) },
    );
    expect(reading.id).toBe('reading-1');
    expect(reading.spreadId).toBe('three-card');
    expect(reading.spreadVersion).toBe(getSpread('three-card').version);
    expect(reading.question).toBeNull();
    expect(reading.drawnAt).toEqual(new Date('2026-10-13T08:00:00.000Z'));
    expect(reading.cards.map((card) => card.positionKey)).toEqual(['past', 'present', 'future']);
  });

  it('draws as many distinct cards as the spread has positions, for every spread', () => {
    for (const id of ['one-card', 'three-card', 'celtic-cross']) {
      const reading = drawReading(id, { includeReversed: true }, { ...FIXED, rng: seededRng(11) });
      const spread = getSpread(id);
      expect(reading.cards).toHaveLength(spread.positions.length);
      expect(new Set(reading.cards.map((card) => card.cardId)).size).toBe(reading.cards.length);
      for (const card of reading.cards) expect(ALL_CARD_IDS).toContain(card.cardId);
    }
  });

  it('is repeatable with the same seed', () => {
    const a = drawReading(
      'celtic-cross',
      { includeReversed: true },
      { ...FIXED, rng: seededRng(42) },
    );
    const b = drawReading(
      'celtic-cross',
      { includeReversed: true },
      { ...FIXED, rng: seededRng(42) },
    );
    expect(a).toEqual(b);
  });

  it('draws only upright cards when reversals are off', () => {
    for (let seed = 0; seed < 200; seed++) {
      const reading = drawReading(
        'celtic-cross',
        { includeReversed: false },
        { rng: seededRng(seed) },
      );
      expect(reading.cards.every((card) => card.orientation === 'upright')).toBe(true);
    }
  });

  it('draws with reversals on by default, and with real randomness and ids when nothing is injected', () => {
    const readings = Array.from({ length: 30 }, () => drawReading('celtic-cross'));
    expect(new Set(readings.map((reading) => reading.id)).size).toBe(30);
    expect(
      readings.some((reading) => reading.cards.some((card) => card.orientation === 'reversed')),
    ).toBe(true);
    expect(
      new Set(readings.map((reading) => reading.cards.map((card) => card.cardId).join())).size,
    ).toBeGreaterThan(25);
  });

  it('throws on an unknown spread', () => {
    expect(() => drawReading('nine-card')).toThrow(/Unknown spread/);
  });

  it('draws from the same deck the content registry holds', () => {
    // drawReading uses the domain ids so the browser need not load the 78 cards.
    expect(DECK_IDS).toEqual(ALL_CARD_IDS);
  });
});

describe('reading cards', () => {
  it('keeps the face and the two meanings, and leaves the long texts behind', () => {
    const card = getCard('the-hermit');
    const slim = toReadingCard(card);
    expect(Object.keys(slim).sort()).toEqual(['id', 'image', 'meanings', 'name']);
    expect(slim.meanings).toBe(card.meanings);
  });

  it('covers all 78 cards in deck order', () => {
    expect(getReadingCards().map((card) => card.id)).toEqual(ALL_CARD_IDS);
  });
});
