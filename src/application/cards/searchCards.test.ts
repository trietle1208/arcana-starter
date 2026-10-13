import { describe, expect, it } from 'vitest';
import type { CardQuery } from './cardQuery';
import { getCardSummaries } from './cardSummaries';
import { normalizeText, searchCards } from './searchCards';

const cards = getCardSummaries();
const find = (q: string, rest: Partial<CardQuery> = {}, locale: 'en' | 'vi' = 'en') =>
  searchCards(cards, { q, sort: 'number', ...rest }, locale).map((card) => card.id);

describe('normalizeText', () => {
  it('lowercases, drops accents and turns đ into d', () => {
    expect(normalizeText('Ẩn  Sĩ')).toBe('an si');
    expect(normalizeText('Đôi Tình Nhân')).toBe('doi tinh nhan');
    expect(normalizeText('  The   Hermit ')).toBe('the hermit');
  });
});

describe('searchCards: query', () => {
  it('returns all 78 cards in deck order for an empty query', () => {
    expect(find('')).toHaveLength(78);
    expect(find('   ')).toHaveLength(78);
    expect(find('')[0]).toBe('the-fool');
    expect(find('')[77]).toBe('pentacles-king');
  });

  it('finds a card by its English name, in any case and by part of the name', () => {
    expect(find('hermit')).toEqual(['the-hermit']);
    expect(find('HERMIT')).toEqual(['the-hermit']);
    expect(find('high priest')).toEqual(['the-high-priestess']);
    expect(find('priestess high')).toEqual(['the-high-priestess']);
  });

  it('finds a card by its Vietnamese name, with or without accents', () => {
    expect(find('ẩn sĩ')).toEqual(['the-hermit']);
    expect(find('an si')).toEqual(['the-hermit']);
    expect(find('AN   SI')).toEqual(['the-hermit']);
    expect(find('doi tinh nhan')).toEqual(['the-lovers']);
    expect(find('đôi tình nhân')).toEqual(['the-lovers']);
  });

  it('finds a card by a keyword in either language', () => {
    expect(find('solitude')).toContain('the-hermit');
    expect(find('cô tịch')).toEqual([]);
    expect(find('o mot minh')).toContain('the-hermit');
    expect(find('beginnings')).toContain('the-fool');
    expect(find('khoi dau')).toContain('the-fool');
  });

  it('matches a word by its start, or the whole query anywhere in a name', () => {
    expect(find('herm')).toEqual(['the-hermit']);
    expect(find('ermit')).toEqual(['the-hermit']);
    expect(find('an si')).not.toContain('wands-06');
  });

  it('matches several words in any order within one name or keyword', () => {
    expect(find('of cups')).toHaveLength(14);
    expect(find('cups of')).toHaveLength(14);
    expect(find('hermit fool')).toEqual([]);
  });

  it('does not search the "TODO" placeholder', () => {
    expect(find('todo')).toEqual([]);
  });

  it('returns nothing when no card matches', () => {
    expect(find('zzzz')).toEqual([]);
  });
});

describe('searchCards: filters', () => {
  it('filters by arcana', () => {
    expect(find('', { arcana: 'major' })).toHaveLength(22);
    expect(find('', { arcana: 'minor' })).toHaveLength(56);
  });

  it('filters by suit', () => {
    for (const suit of ['cups', 'wands', 'swords', 'pentacles'] as const) {
      const ids = find('', { suit });
      expect(ids).toHaveLength(14);
      expect(ids.every((id) => id.startsWith(`${suit}-`))).toBe(true);
    }
  });

  it('combines arcana and suit', () => {
    expect(find('', { arcana: 'minor', suit: 'cups' })).toHaveLength(14);
    expect(find('', { arcana: 'major', suit: 'cups' })).toEqual([]);
  });

  it('combines the filters with the search text', () => {
    expect(find('king')).toEqual(['cups-king', 'wands-king', 'swords-king', 'pentacles-king']);
    expect(find('king', { suit: 'wands' })).toEqual(['wands-king']);
    expect(find('king', { arcana: 'major' })).toEqual([]);
    expect(find('the', { arcana: 'major' }).length).toBeGreaterThan(10);
  });
});

describe('searchCards: sort', () => {
  it('sorts by number in deck order', () => {
    const orders = searchCards(cards, { q: '', sort: 'number' }).map((card) => card.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(find('', { suit: 'swords' })[0]).toBe('swords-ace');
    expect(find('', { suit: 'swords' }).at(-1)).toBe('swords-king');
  });

  it('sorts by name in the language of the reader', () => {
    const en = find('', { sort: 'name' }, 'en');
    const vi = find('', { sort: 'name' }, 'vi');
    const byName = (locale: 'en' | 'vi', ids: string[]) =>
      ids.map((id) => cards.find((card) => card.id === id)!.name[locale]);
    const enCollator = new Intl.Collator('en', { sensitivity: 'base' });
    const viCollator = new Intl.Collator('vi', { sensitivity: 'base' });
    const enNames = byName('en', en);
    const viNames = byName('vi', vi);
    expect(enNames).toEqual([...enNames].sort(enCollator.compare));
    expect(viNames).toEqual([...viNames].sort(viCollator.compare));
    expect(enNames[0]).toBe('Ace of Cups');
    expect(en).not.toEqual(vi);
  });

  it('keeps the filters when it sorts', () => {
    expect(find('', { arcana: 'major', sort: 'name' })).toHaveLength(22);
    expect(find('', { arcana: 'major', sort: 'name' })[0]).toBe('death');
  });

  it('does not change the list it is given', () => {
    const copy = [...cards];
    searchCards(cards, { q: '', sort: 'name' });
    expect(cards).toEqual(copy);
  });
});
