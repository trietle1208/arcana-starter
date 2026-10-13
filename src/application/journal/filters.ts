import type { JournalListItem } from './journal';

export type JournalType = 'readings' | 'reflections';

export interface JournalFilter {
  type?: JournalType;
  tag?: string;
}

/** Entries that match: a reading or a free reflection, and/or carrying a tag (ignoring case). */
export function filterJournal(
  items: readonly JournalListItem[],
  { type, tag }: JournalFilter,
): JournalListItem[] {
  const wanted = tag?.toLocaleLowerCase();
  return items.filter(({ entry }) => {
    if (type === 'readings' && entry.readingId === null) return false;
    if (type === 'reflections' && entry.readingId !== null) return false;
    if (wanted && !entry.tags.some((t) => t.toLocaleLowerCase() === wanted)) return false;
    return true;
  });
}

/** Every tag in use with how many entries carry it, most used first. */
export function collectTags(items: readonly JournalListItem[]): { tag: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const { entry } of items) {
    for (const tag of entry.tags) {
      const key = tag.toLocaleLowerCase();
      const found = counts.get(key);
      if (found) found.count += 1;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
