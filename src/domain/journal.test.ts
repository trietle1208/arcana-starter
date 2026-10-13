import { describe, expect, it } from 'vitest';
import { excerptOf, normalizeTags, splitTagInput } from './journal';

describe('tags', () => {
  it('trims, drops empties and repeats (ignoring case), keeping the first spelling', () => {
    expect(normalizeTags([' Work ', '', 'calm', 'WORK', 'Calm', 'Friends'])).toEqual([
      'Work',
      'calm',
      'Friends',
    ]);
  });

  it('splits what the reader typed on commas, semicolons and new lines', () => {
    expect(splitTagInput('Work, Calm;  Friends\nwork')).toEqual(['Work', 'Calm', 'Friends']);
    expect(splitTagInput('')).toEqual([]);
    expect(splitTagInput(' , ,, ')).toEqual([]);
  });
});

describe('excerptOf', () => {
  it('flattens whitespace and leaves a short note alone', () => {
    expect(excerptOf('A  quiet\n\nweek ')).toBe('A quiet week');
    expect(excerptOf('')).toBe('');
  });

  it('cuts a long note at a word and ends with an ellipsis', () => {
    const text = 'quiet '.repeat(100);
    const cut = excerptOf(text, 50);
    expect(cut.endsWith('…')).toBe(true);
    expect(cut.length).toBeLessThanOrEqual(51);
    expect(cut).not.toMatch(/qui…$/);
  });

  it('cuts a single long word where it must', () => {
    expect(excerptOf('x'.repeat(300), 20)).toBe(`${'x'.repeat(20)}…`);
  });
});
