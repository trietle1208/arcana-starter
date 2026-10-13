import type { Locale } from '@/domain/tarot/types';
import { withoutPlaceholders } from '@/domain/tarot/placeholder';
import type { CardQuery } from './cardQuery';
import type { CardSummary } from './cardSummaries';

/** The fields search reads; CardSummary satisfies it. */
export type SearchableCard = Pick<CardSummary, 'arcana' | 'suit' | 'order' | 'name' | 'keywords'>;

/** Lowercase, no accents, "đ" as "d", single spaces: "Ẩn  Sĩ" → "an si". */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every searchable field of a card, in both languages, normalised once. */
function searchFields(card: SearchableCard): string[] {
  return [
    card.name.en,
    card.name.vi,
    ...withoutPlaceholders(card.keywords.en),
    ...withoutPlaceholders(card.keywords.vi),
  ].map(normalizeText);
}

/**
 * A field matches when it contains the whole query ("ermit", "an si"), or when every word of the
 * query starts a word of the field, in any order ("priestess high"). Words are matched by their
 * start so that "an si" finds "Ẩn Sĩ" and not "Six of Wands".
 */
function fieldMatches(field: string, phrase: string, words: string[]): boolean {
  if (field.includes(phrase)) return true;
  const fieldWords = field.split(' ');
  return words.every((word) => fieldWords.some((fieldWord) => fieldWord.startsWith(word)));
}

/**
 * Filters and sorts the cards. A card matches when one of its names or keywords (English or
 * Vietnamese, accents ignored) matches the query; see fieldMatches.
 * `locale` only decides how "sort by name" orders the cards.
 */
export function searchCards<T extends SearchableCard>(
  cards: readonly T[],
  query: CardQuery,
  locale: Locale = 'en',
): T[] {
  const phrase = normalizeText(query.q);
  const words = phrase.split(' ').filter(Boolean);
  const matches = cards.filter((card) => {
    if (query.arcana && card.arcana !== query.arcana) return false;
    if (query.suit && card.suit !== query.suit) return false;
    if (words.length === 0) return true;
    return searchFields(card).some((field) => fieldMatches(field, phrase, words));
  });

  if (query.sort === 'name') {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    return matches.sort(
      (a, b) => collator.compare(a.name[locale], b.name[locale]) || a.order - b.order,
    );
  }
  return matches.sort((a, b) => a.order - b.order);
}
