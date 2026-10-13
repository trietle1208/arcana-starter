import { ALL_CARDS, getCard } from '@/content';
import type { InterpretationDetail } from '@/domain/records';
import type { TarotCard } from '@/domain/tarot/types';

/**
 * What the Reading Room needs of a card: its face and its two meanings. With the "full"
 * interpretation detail it also carries the symbolism and the reflection questions, which the
 * brief view leaves out to keep what is sent to the browser small.
 */
export type ReadingCard = Pick<TarotCard, 'id' | 'name' | 'image' | 'meanings'> &
  Partial<Pick<TarotCard, 'symbolism' | 'reflectionQuestions'>>;

export function toReadingCard(
  card: TarotCard,
  detail: InterpretationDetail = 'brief',
): ReadingCard {
  const base: ReadingCard = {
    id: card.id,
    name: card.name,
    image: card.image,
    meanings: card.meanings,
  };
  return detail === 'full'
    ? { ...base, symbolism: card.symbolism, reflectionQuestions: card.reflectionQuestions }
    : base;
}

/** All 78 in deck order, small enough to pass from the server page to the client room. */
export function getReadingCards(detail: InterpretationDetail = 'brief'): ReadingCard[] {
  return ALL_CARDS.map((card) => toReadingCard(card, detail));
}

/** Just the cards of one reading (a journal entry shows ten at most). */
export function getReadingCardsFor(
  ids: readonly string[],
  detail: InterpretationDetail = 'brief',
): ReadingCard[] {
  return [...new Set(ids)].map((id) => toReadingCard(getCard(id), detail));
}
