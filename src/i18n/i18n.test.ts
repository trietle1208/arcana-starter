import { describe, expect, it } from 'vitest';
import { en } from './en';
import { DEFAULT_LOCALE, isLocale, LOCALES, t, type TranslationKey } from './index';
import { vi } from './vi';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('dictionaries', () => {
  it('define the same keys in English and Vietnamese', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });

  it('have no empty strings', () => {
    for (const [key, text] of [...Object.entries(en), ...Object.entries(vi)]) {
      expect(text.trim(), key).not.toBe('');
    }
  });

  it('use the same {placeholders} in both languages', () => {
    for (const key of Object.keys(en) as TranslationKey[]) {
      expect(placeholders(vi[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it('translate: Vietnamese differs from English for the navigation', () => {
    for (const key of ['nav.library', 'nav.reading', 'library.title', 'detail.back'] as const) {
      expect(vi[key], key).not.toBe(en[key]);
    }
  });
});

describe('t', () => {
  it('looks a string up by locale', () => {
    expect(t('en', 'nav.library')).toBe('Card library');
    expect(t('vi', 'nav.library')).toBe('Thư viện bài');
  });

  it('fills in placeholders', () => {
    expect(t('en', 'library.showing', { shown: 10, total: 78 })).toBe('Showing 10 of 78');
    expect(t('vi', 'library.showing', { shown: 10, total: 78 })).toBe('Hiển thị 10 trên 78');
    expect(t('en', 'card.altReversed', { name: 'The Hermit' })).toBe('The Hermit (reversed)');
  });

  it('leaves a placeholder that has no value', () => {
    expect(t('en', 'library.showing', { shown: 1 })).toBe('Showing 1 of {total}');
    expect(t('en', 'library.showing')).toBe('Showing {shown} of {total}');
  });

  it('knows its locales', () => {
    expect(LOCALES).toEqual(['en', 'vi']);
    expect(DEFAULT_LOCALE).toBe('en');
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});
