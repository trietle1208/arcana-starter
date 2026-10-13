import { ALL_CARDS } from '@/content';
import type { TarotCard } from '@/domain/tarot/types';

/** What the Reading Room needs of a card: its face and its two meanings, not the long texts. */
export type ReadingCard = Pick<TarotCard, 'id' | 'name' | 'image' | 'meanings'>;

export function toReadingCard(card: TarotCard): ReadingCard {
  return { id: card.id, name: card.name, image: card.image, meanings: card.meanings };
}

/** All 78 in deck order, small enough to pass from the server page to the client room. */
export function getReadingCards(): ReadingCard[] {
  return ALL_CARDS.map(toReadingCard);
}
