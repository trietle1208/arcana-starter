import { describe, expect, it } from 'vitest';
import { dayOf, groupByMonth, longDate, monthHeading, shortMonth } from './format';

// Local-time dates on purpose: the app shows the time zone of the machine it runs on.
const at = (month: number, day: number, year = 2026) => new Date(year, month - 1, day, 10, 30);

describe('dates', () => {
  it('names the month and the day in each language', () => {
    expect(dayOf(at(10, 12))).toBe('12');
    expect(shortMonth(at(10, 12), 'en')).toBe('Oct');
    expect(shortMonth(at(10, 12), 'vi')).toBe('T10');
    expect(longDate(at(10, 12), 'en')).toBe('12 October 2026');
    expect(longDate(at(10, 12), 'vi')).toMatch(/12.*10.*2026/);
  });

  it('adds the year to a month heading only when it is not this year', () => {
    const now = at(10, 13);
    expect(monthHeading(at(10, 1), 'en', now)).toBe('October');
    expect(monthHeading(at(12, 31, 2025), 'en', now)).toBe('December 2025');
    expect(monthHeading(at(3, 1), 'vi', now)).toMatch(/3/);
  });
});

describe('groupByMonth', () => {
  it('groups newest-first items by calendar month, keeping their order', () => {
    const items = [at(10, 12), at(10, 3), at(9, 30), at(9, 1), at(10, 1, 2025)].map((date, id) => ({
      id,
      date,
    }));
    const groups = groupByMonth(items, (item) => item.date);
    expect(groups.map((group) => group.items.map((item) => item.id))).toEqual([
      [0, 1],
      [2, 3],
      [4],
    ]);
  });

  it('keeps the same month of another year apart', () => {
    const groups = groupByMonth([at(10, 5), at(10, 5, 2025)], (date) => date);
    expect(groups).toHaveLength(2);
  });

  it('is empty for no entries', () => {
    expect(groupByMonth([], () => new Date())).toEqual([]);
  });
});
