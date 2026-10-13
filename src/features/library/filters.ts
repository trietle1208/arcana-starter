import type { CardQuery } from '@/application/cards/cardQuery';
import type { Suit } from '@/domain/tarot/types';
import type { TranslationKey } from '@/i18n';

/** The chips of the library: one row, one choice. The query itself can combine arcana and suit. */
export type LibraryFilter = 'all' | 'major' | Suit;

export const LIBRARY_FILTERS: readonly { id: LibraryFilter; label: TranslationKey }[] = [
  { id: 'all', label: 'library.filter.all' },
  { id: 'major', label: 'arcana.major' },
  { id: 'cups', label: 'suit.cups' },
  { id: 'wands', label: 'suit.wands' },
  { id: 'swords', label: 'suit.swords' },
  { id: 'pentacles', label: 'suit.pentacles' },
];

/** The chip a query lights up; undefined when the URL asks for something no chip stands for. */
export function filterOf(query: CardQuery): LibraryFilter | undefined {
  if (query.suit) return query.suit;
  if (query.arcana === 'major') return 'major';
  if (!query.arcana) return 'all';
  return undefined;
}

export function withFilter(query: CardQuery, filter: LibraryFilter): CardQuery {
  const next: CardQuery = { q: query.q, sort: query.sort };
  if (filter === 'major') next.arcana = 'major';
  else if (filter !== 'all') next.suit = filter;
  return next;
}
