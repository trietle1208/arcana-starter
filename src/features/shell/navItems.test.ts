import { describe, expect, it } from 'vitest';
import { t } from '@/i18n';
import { activeNavId, BOTTOM_NAV_ITEMS, NAV_ITEMS, toNavItems } from './navItems';

describe('navigation', () => {
  it('lists the six destinations in order', () => {
    expect(NAV_ITEMS.map((item) => item.id)).toEqual([
      'home',
      'library',
      'reading',
      'study',
      'journal',
      'settings',
    ]);
  });

  it('keeps Settings out of the bottom bar', () => {
    expect(BOTTOM_NAV_ITEMS).toHaveLength(5);
    expect(BOTTOM_NAV_ITEMS.some((item) => item.id === 'settings')).toBe(false);
  });

  it('marks the section of the current path as active', () => {
    expect(activeNavId('/')).toBe('home');
    expect(activeNavId('/library')).toBe('library');
    expect(activeNavId('/library/the-hermit')).toBe('library');
    expect(activeNavId('/journal/new')).toBe('journal');
    expect(activeNavId('/nowhere')).toBeUndefined();
  });

  it('translates the labels into the language of the reader', () => {
    const english = toNavItems(NAV_ITEMS, (key) => t('en', key));
    const vietnamese = toNavItems(NAV_ITEMS, (key) => t('vi', key));
    expect(english.find((item) => item.id === 'library')?.label).toBe('Card library');
    expect(vietnamese.find((item) => item.id === 'library')?.label).toBe('Thư viện bài');
    expect(vietnamese.find((item) => item.id === 'library')?.shortLabel).toBe('Thư viện');
    expect(vietnamese.find((item) => item.id === 'settings')?.shortLabel).toBeUndefined();
    expect(english.map((item) => item.href)).toEqual(vietnamese.map((item) => item.href));
  });
});
