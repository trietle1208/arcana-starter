import { describe, expect, it } from 'vitest';
import type { DrawnCard } from '../records';
import { interpret, interpretationFor } from './interpret';
import type { TarotCard, TarotSpread } from './types';

// A tiny card and spread of its own: the domain tests do not depend on the content files.
const text = (en: string, vi: string) => ({ en, vi });
const card: TarotCard = {
  id: 'the-hermit',
  arcana: 'major',
  number: 9,
  name: text('The Hermit', 'Ẩn Sĩ'),
  image: '/cards/09-the-hermit.webp',
  intro: text('Intro', 'Giới thiệu'),
  keywords: { en: ['Solitude'], vi: ['Ở một mình'] },
  meanings: {
    upright: {
      summary: text('Time alone with purpose.', 'Thời gian ở một mình có chủ đích.'),
      keywords: { en: ['Reflection'], vi: ['Suy ngẫm'] },
    },
    reversed: {
      summary: text('Isolation that no longer helps.', 'Sự cô lập đã thôi giúp ích.'),
      keywords: { en: ['Isolation'], vi: ['Cô lập'] },
    },
  },
  symbolism: text('A lantern.', 'Một chiếc đèn lồng.'),
  reflectionQuestions: { en: ['Q?'], vi: ['H?'] },
};

const position = (key: string, en: string, vi: string, col: number) => ({
  key,
  name: text(en, vi),
  prompt: text(`${en} prompt`, `${vi} gợi ý`),
  layout: { col, row: 1 },
});
const spread: TarotSpread = {
  id: 'three-card',
  version: 1,
  name: text('Three cards', 'Ba lá'),
  description: text('Past, present, future', 'Quá khứ, hiện tại, tương lai'),
  grid: { cols: 3, rows: 1 },
  positions: [
    position('past', 'Past', 'Quá khứ', 1),
    position('present', 'Present', 'Hiện tại', 2),
    position('future', 'Future', 'Tương lai', 3),
  ],
};

const drawn = (over: Partial<DrawnCard> = {}): DrawnCard => ({
  positionIndex: 1,
  positionKey: 'present',
  cardId: 'the-hermit',
  orientation: 'upright',
  ...over,
});

describe('interpretationFor', () => {
  it('returns the upright reading for an upright card and the reversed one otherwise', () => {
    expect(interpretationFor(card, 'upright')).toBe(card.meanings.upright);
    expect(interpretationFor(card, 'reversed')).toBe(card.meanings.reversed);
    expect(interpretationFor(card, 'upright')).not.toBe(interpretationFor(card, 'reversed'));
  });
});

describe('interpret', () => {
  it('gives the same card a different meaning upright and reversed', () => {
    const up = interpret(drawn({ orientation: 'upright' }), card, spread);
    const down = interpret(drawn({ orientation: 'reversed' }), card, spread);
    expect(up.meaning.summary.en).toBe('Time alone with purpose.');
    expect(down.meaning.summary.en).toBe('Isolation that no longer helps.');
    expect(up.card).toBe(down.card);
    expect(up.orientation).toBe('upright');
    expect(down.orientation).toBe('reversed');
  });

  it('takes the position name and prompt from the drawn index', () => {
    for (const [index, key] of [
      [0, 'past'],
      [1, 'present'],
      [2, 'future'],
    ] as const) {
      const result = interpret(drawn({ positionIndex: index, positionKey: key }), card, spread);
      expect(result.position).toBe(spread.positions[index]);
      expect(result.position.key).toBe(key);
    }
    expect(interpret(drawn(), card, spread).position.prompt.vi).toBe('Hiện tại gợi ý');
  });

  it('rejects a position outside the spread', () => {
    expect(() => interpret(drawn({ positionIndex: 3 }), card, spread)).toThrow(RangeError);
    expect(() => interpret(drawn({ positionIndex: -1 }), card, spread)).toThrow(RangeError);
  });

  it('rejects a position key that does not belong to the index, or another card', () => {
    expect(() => interpret(drawn({ positionKey: 'past' }), card, spread)).toThrow(/not "past"/);
    expect(() => interpret(drawn({ cardId: 'the-fool' }), card, spread)).toThrow(/does not match/);
  });
});
