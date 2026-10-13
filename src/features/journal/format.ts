import type { Locale } from '@/domain/tarot/types';

// Dates are shown in the time zone of the machine the app runs on (the container gets the host's
// from compose.yaml), which is the reader's own: one person, one computer.

const BCP47: Record<Locale, string> = { en: 'en-GB', vi: 'vi-VN' };

/** "12" */
export const dayOf = (date: Date) => String(date.getDate());

/** "Oct" / "T10": Vietnamese names its months by number, and "Tháng 10" would not fit the date column. */
export function shortMonth(date: Date, locale: Locale): string {
  if (locale === 'vi') return `T${date.getMonth() + 1}`;
  return new Intl.DateTimeFormat(BCP47[locale], { month: 'short' }).format(date);
}

/** "October" / "Tháng 10", with the year when it is not the current one. */
export function monthHeading(date: Date, locale: Locale, now: Date): string {
  const withYear = date.getFullYear() !== now.getFullYear();
  return new Intl.DateTimeFormat(BCP47[locale], {
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(date);
}

/** "12 October 2026" / "12 tháng 10, 2026" */
export function longDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(BCP47[locale], { dateStyle: 'long' }).format(date);
}

/** Groups newest-first items by calendar month, keeping their order. */
export function groupByMonth<T>(
  items: readonly T[],
  dateOf: (item: T) => Date,
): { key: string; date: Date; items: T[] }[] {
  const groups: { key: string; date: Date; items: T[] }[] = [];
  for (const item of items) {
    const date = dateOf(item);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, date, items: [item] });
  }
  return groups;
}
