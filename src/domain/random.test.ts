import { describe, expect, it } from 'vitest';
import { cryptoRng, randomInt, seededRng } from './random';

describe('seededRng', () => {
  it('repeats the same sequence for the same seed and differs for another', () => {
    const a = seededRng(7);
    const b = seededRng(7);
    const first = Array.from({ length: 20 }, () => a());
    expect(Array.from({ length: 20 }, () => b())).toEqual(first);
    const other = seededRng(8);
    expect(Array.from({ length: 20 }, () => other())).not.toEqual(first);
  });

  it('is mulberry32: seed 42 starts at the published values', () => {
    const rng = seededRng(42);
    expect(rng()).toBeCloseTo(0.6011037519201636, 15);
    expect(rng()).toBeCloseTo(0.44829055899754167, 15);
    expect(rng()).toBeCloseTo(0.8524657934904099, 15);
  });

  it('stays inside [0, 1)', () => {
    const rng = seededRng(123);
    for (let i = 0; i < 10_000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('cryptoRng', () => {
  it('returns floats in [0, 1) that are not all the same', () => {
    const rng = cryptoRng();
    const values = Array.from({ length: 200 }, () => rng());
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(new Set(values).size).toBeGreaterThan(190);
  });
});

describe('randomInt', () => {
  it('maps the unit interval onto 0 … max-1', () => {
    expect(randomInt(() => 0, 78)).toBe(0);
    expect(randomInt(() => 0.5, 78)).toBe(39);
    expect(randomInt(() => 0.999_999_999, 78)).toBe(77);
  });
});
