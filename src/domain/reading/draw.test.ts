import { describe, expect, it } from 'vitest';
import { seededRng, type Rng } from '../random';
import { DECK_IDS } from '../tarot/deck';
import type { TarotSpread } from '../tarot/types';
import { drawSpread, sampleWithoutReplacement } from './draw';

// A bare spread of its own: the engine uses only the count and the keys, so these tests do not
// depend on the content files.
function spreadOf(count: number): TarotSpread {
  return {
    id: `spread-${count}`,
    version: 1,
    name: { en: 'Test', vi: 'Thử' },
    description: { en: '', vi: '' },
    grid: { cols: count, rows: 1 },
    positions: Array.from({ length: count }, (_, i) => ({
      key: `p${i}`,
      name: { en: `P${i}`, vi: `V${i}` },
      prompt: { en: '', vi: '' },
      layout: { col: i + 1, row: 1 },
    })),
  };
}

const ONE = spreadOf(1);
const THREE = spreadOf(3);
const CELTIC = spreadOf(10);

describe('sampleWithoutReplacement', () => {
  it('with rng = 0 takes the first k items in order', () => {
    expect(sampleWithoutReplacement(['a', 'b', 'c', 'd', 'e'], 3, () => 0)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('with an rng just below 1 still picks valid, distinct items', () => {
    const items = Array.from({ length: 78 }, (_, i) => i);
    const picked = sampleWithoutReplacement(items, 10, () => 0.999_999_999_9);
    expect(picked).toHaveLength(10);
    expect(new Set(picked).size).toBe(10);
    for (const item of picked) expect(items).toContain(item);
  });

  it('does not change the list it samples from', () => {
    const items = ['a', 'b', 'c', 'd'];
    sampleWithoutReplacement(items, 4, seededRng(1));
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('can take the whole list, and nothing', () => {
    expect(sampleWithoutReplacement(['a', 'b', 'c'], 3, seededRng(5)).sort()).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(sampleWithoutReplacement(['a', 'b', 'c'], 0, seededRng(5))).toEqual([]);
  });

  it('throws RangeError for more items than the deck holds, and for a bad count', () => {
    expect(() => sampleWithoutReplacement(DECK_IDS, 79, seededRng(1))).toThrow(RangeError);
    expect(() => sampleWithoutReplacement(DECK_IDS, -1, seededRng(1))).toThrow(RangeError);
    expect(() => sampleWithoutReplacement(DECK_IDS, 1.5, seededRng(1))).toThrow(RangeError);
  });
});

describe('drawSpread', () => {
  it('with rng = 0 gives the first k cards in deck order, all reversed', () => {
    const drawn = drawSpread(THREE, DECK_IDS, { rng: () => 0, includeReversed: true });
    expect(drawn).toEqual([
      { positionIndex: 0, positionKey: 'p0', cardId: 'the-fool', orientation: 'reversed' },
      { positionIndex: 1, positionKey: 'p1', cardId: 'the-magician', orientation: 'reversed' },
      {
        positionIndex: 2,
        positionKey: 'p2',
        cardId: 'the-high-priestess',
        orientation: 'reversed',
      },
    ]);
  });

  // Recorded from an independent port of mulberry32 and of the algorithm (not from this code),
  // so a change to the sampling or to the order the random numbers are used in fails here.
  it('matches the stored result for seed 42 on a ten-card spread', () => {
    const drawn = drawSpread(CELTIC, DECK_IDS, { rng: seededRng(42), includeReversed: true });
    expect(drawn.map((d) => [d.cardId, d.orientation])).toEqual([
      ['wands-page', 'reversed'],
      ['cups-king', 'upright'],
      ['pentacles-03', 'upright'],
      ['swords-04', 'reversed'],
      ['the-tower', 'reversed'],
      ['wands-08', 'upright'],
      ['cups-04', 'upright'],
      ['swords-02', 'upright'],
      ['pentacles-05', 'reversed'],
      ['wands-06', 'reversed'],
    ]);
  });

  it('never repeats a card and maps every draw to its position, over 10,000 seeds', () => {
    const problems: string[] = [];
    for (let seed = 0; seed < 10_000; seed++) {
      const drawn = drawSpread(CELTIC, DECK_IDS, { rng: seededRng(seed), includeReversed: true });
      if (drawn.length !== CELTIC.positions.length) problems.push(`seed ${seed}: length`);
      if (new Set(drawn.map((d) => d.cardId)).size !== drawn.length)
        problems.push(`seed ${seed}: duplicate`);
      drawn.forEach((d, i) => {
        const position = CELTIC.positions[i];
        if (
          d.positionIndex !== i ||
          d.positionKey !== position.key ||
          !DECK_IDS.includes(d.cardId)
        ) {
          problems.push(`seed ${seed}: position ${i}`);
        }
      });
    }
    expect(problems).toEqual([]);
  });

  it('draws only upright cards when reversals are off, over 1,000 draws', () => {
    for (let seed = 0; seed < 1_000; seed++) {
      const drawn = drawSpread(CELTIC, DECK_IDS, { rng: seededRng(seed), includeReversed: false });
      for (const d of drawn) expect(d.orientation).toBe('upright');
    }
  });

  it('keeps the same cards whether or not reversals are on, only the orientation differs', () => {
    // Reversals are decided after the sample, so turning them off does not reshuffle the draw.
    const on = drawSpread(CELTIC, DECK_IDS, { rng: seededRng(9), includeReversed: true });
    const off = drawSpread(CELTIC, DECK_IDS, { rng: seededRng(9), includeReversed: false });
    expect(off.map((d) => d.cardId)).toEqual(on.map((d) => d.cardId));
  });

  it('honours a custom reversed chance of 0 and 1', () => {
    const rng = (): Rng => seededRng(3);
    const never = drawSpread(CELTIC, DECK_IDS, {
      rng: rng(),
      includeReversed: true,
      reversedChance: 0,
    });
    const always = drawSpread(CELTIC, DECK_IDS, {
      rng: rng(),
      includeReversed: true,
      reversedChance: 1,
    });
    expect(never.every((d) => d.orientation === 'upright')).toBe(true);
    expect(always.every((d) => d.orientation === 'reversed')).toBe(true);
  });

  it('throws RangeError when the spread needs more cards than the deck has', () => {
    expect(() =>
      drawSpread(CELTIC, DECK_IDS.slice(0, 9), { rng: seededRng(1), includeReversed: true }),
    ).toThrow(RangeError);
  });

  it('is uniform: 78,000 one-card draws land evenly on the 78 cards and split orientation evenly', () => {
    const rng = seededRng(2024);
    const counts = new Map<string, number>(DECK_IDS.map((id) => [id, 0]));
    let reversed = 0;
    const draws = 78_000;
    for (let i = 0; i < draws; i++) {
      const [card] = drawSpread(ONE, DECK_IDS, { rng, includeReversed: true });
      counts.set(card.cardId, (counts.get(card.cardId) ?? 0) + 1);
      if (card.orientation === 'reversed') reversed++;
    }
    const expected = draws / DECK_IDS.length;
    let chiSquare = 0;
    for (const count of counts.values()) chiSquare += (count - expected) ** 2 / expected;
    // 77 degrees of freedom: 122 is p ≈ 0.001.
    expect(chiSquare).toBeLessThan(122);
    expect(Math.abs(reversed / draws - 0.5)).toBeLessThan(0.02);
  });

  it('is unbiased about position too: any card is as likely in the first place as in the last', () => {
    const rng = seededRng(77);
    const draws = 39_000;
    let first = 0;
    let last = 0;
    for (let i = 0; i < draws; i++) {
      const drawn = drawSpread(THREE, DECK_IDS, { rng, includeReversed: false });
      if (drawn[0].cardId === 'the-fool') first++;
      if (drawn[2].cardId === 'the-fool') last++;
    }
    const expected = draws / DECK_IDS.length; // 500
    // Poisson-ish spread: about ±22 is one standard deviation, so ±100 is four.
    expect(Math.abs(first - expected)).toBeLessThan(100);
    expect(Math.abs(last - expected)).toBeLessThan(100);
  });
});
