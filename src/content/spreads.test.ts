import { describe, expect, it } from 'vitest';
import { SPREAD_IDS, SPREADS, getSpread, hasSpread } from './spreads';

const LOCALES = ['en', 'vi'] as const;

describe('spreads', () => {
  it('offers one card, three cards and the Celtic Cross, in that order', () => {
    expect(SPREAD_IDS).toEqual(['one-card', 'three-card', 'celtic-cross']);
    expect(SPREADS.map((spread) => spread.positions.length)).toEqual([1, 3, 10]);
  });

  it('looks a spread up by id and throws on an unknown one', () => {
    expect(getSpread('three-card').id).toBe('three-card');
    expect(hasSpread('celtic-cross')).toBe(true);
    expect(hasSpread('nine-card')).toBe(false);
    expect(() => getSpread('nine-card')).toThrow(/Unknown spread/);
  });

  describe.each(SPREADS.map((spread) => [spread.id, spread] as const))('%s', (_id, spread) => {
    it('has a version, a name and a description in English and Vietnamese', () => {
      expect(spread.version).toBeGreaterThanOrEqual(1);
      for (const locale of LOCALES) {
        expect(spread.name[locale].trim()).not.toBe('');
        expect(spread.description[locale].trim()).not.toBe('');
      }
    });

    it('has unique position keys', () => {
      const keys = spread.positions.map((position) => position.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const key of keys) expect(key).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });

    it('names every position and gives it a prompt in both languages', () => {
      for (const position of spread.positions) {
        for (const locale of LOCALES) {
          expect(position.name[locale].trim()).not.toBe('');
          expect(position.prompt[locale].trim()).not.toBe('');
        }
      }
    });

    it('keeps every layout cell inside its grid, on whole or half rows', () => {
      for (const { layout, key } of spread.positions) {
        expect(Number.isInteger(layout.col), `${key} col`).toBe(true);
        expect(layout.col).toBeGreaterThanOrEqual(1);
        expect(layout.col).toBeLessThanOrEqual(spread.grid.cols);
        expect(Number.isInteger(layout.row * 2), `${key} row`).toBe(true);
        expect(layout.row).toBeGreaterThanOrEqual(1);
        expect(layout.row).toBeLessThanOrEqual(spread.grid.rows);
        if (layout.rotate !== undefined) expect([0, 90]).toContain(layout.rotate);
      }
    });

    it('puts no two cards on the same cell unless one crosses the other', () => {
      const seen = new Map<string, boolean>();
      for (const { layout } of spread.positions) {
        const cell = `${layout.col}/${layout.row}`;
        const crossing = layout.rotate === 90;
        if (seen.has(cell)) expect(crossing).toBe(true);
        seen.set(cell, true);
      }
    });
  });

  it('has the ten positions of the Celtic Cross, with the second lying across the first', () => {
    const celtic = getSpread('celtic-cross');
    expect(celtic.positions).toHaveLength(10);
    expect(celtic.positions.map((position) => position.name.en)).toEqual([
      'Present',
      'Challenge',
      'Foundation',
      'Recent past',
      'Possibility',
      'Near future',
      'Self',
      'Surroundings',
      'Hopes and fears',
      'Outcome',
    ]);
    const [present, challenge] = celtic.positions;
    expect(challenge.layout.rotate).toBe(90);
    expect({ col: challenge.layout.col, row: challenge.layout.row }).toEqual({
      col: present.layout.col,
      row: present.layout.row,
    });
  });

  it('stacks the Celtic Cross staff from the bottom up and centres the cross against it', () => {
    const celtic = getSpread('celtic-cross');
    const staff = celtic.positions.slice(6).map((position) => position.layout);
    expect(new Set(staff.map((layout) => layout.col)).size).toBe(1);
    expect(staff.map((layout) => layout.row)).toEqual([4, 3, 2, 1]);
    const cross = celtic.positions.slice(0, 6).map((position) => position.layout.row);
    const centre = (Math.min(...cross) + Math.max(...cross)) / 2;
    expect(centre).toBe(2.5); // the middle of the staff, which spans rows 1 to 4
  });

  it('lays the three-card spread in one row, left to right', () => {
    const three = getSpread('three-card');
    expect(three.positions.map((position) => position.layout.col)).toEqual([1, 2, 3]);
    expect(three.positions.every((position) => position.layout.row === 1)).toBe(true);
    expect(three.positions.map((position) => position.key)).toEqual(['past', 'present', 'future']);
  });
});
