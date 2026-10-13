import { describe, expect, it } from 'vitest';
import { activeNavId, BOTTOM_NAV_ITEMS, NAV_ITEMS } from './navItems';

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
});
