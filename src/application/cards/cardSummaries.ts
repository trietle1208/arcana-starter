import { ALL_CARDS } from '@/content';
import { deckPosition, romanNumeral } from '@/domain/tarot/deck';
import { withoutPlaceholders } from '@/domain/tarot/placeholder';
import type { CardId, CourtRank, Localized, Suit, TarotCard } from '@/domain/tarot/types';

/** What the library grid needs for one card; small enough to pass from server to client. */
export interface CardSummary {
  id: CardId;
  arcana: 'major' | 'minor';
  suit: Suit | null;
  /** Roman numeral of a major card ("IX", "0"); null for minor cards. */
  numeral: string | null;
  /** Ace is 1; null for major cards. */
  rank: number | CourtRank | null;
  /** Position in deck order, used for "sort by number". */
  order: number;
  name: Localized;
  image: string;
  /** Real keywords only: a card that is still "TODO" has none. */
  keywords: Localized<string[]>;
}

export function toCardSummary(card: TarotCard): CardSummary {
  const isMajor = card.arcana === 'major';
  return {
    id: card.id,
    arcana: card.arcana,
    suit: isMajor ? null : card.suit,
    numeral: isMajor ? romanNumeral(card.number) : null,
    rank: isMajor ? null : card.rank,
    order: deckPosition(card.id),
    name: card.name,
    image: card.image,
    keywords: {
      en: withoutPlaceholders(card.keywords.en),
      vi: withoutPlaceholders(card.keywords.vi),
    },
  };
}

/** All 78 summaries in deck order. */
export function getCardSummaries(): CardSummary[] {
  return ALL_CARDS.map(toCardSummary);
}
