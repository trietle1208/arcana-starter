import type { CardSummary } from '@/application/cards/cardSummaries';
import type { CourtRank, Suit, TarotCard } from '@/domain/tarot/types';
import type { TranslationKey } from '@/i18n';

type Translate = (key: TranslationKey) => string;

const SUIT_KEYS: Record<Suit, TranslationKey> = {
  cups: 'suit.cups',
  wands: 'suit.wands',
  swords: 'suit.swords',
  pentacles: 'suit.pentacles',
};

const RANK_KEYS: Record<number | CourtRank, TranslationKey> = {
  1: 'rank.1',
  2: 'rank.2',
  3: 'rank.3',
  4: 'rank.4',
  5: 'rank.5',
  6: 'rank.6',
  7: 'rank.7',
  8: 'rank.8',
  9: 'rank.9',
  10: 'rank.10',
  page: 'rank.page',
  knight: 'rank.knight',
  queen: 'rank.queen',
  king: 'rank.king',
};

export const suitLabelKey = (suit: Suit): TranslationKey => SUIT_KEYS[suit];
export const rankLabelKey = (rank: number | CourtRank): TranslationKey => RANK_KEYS[rank];

/** The quiet line above a tile's name: "Major · IX" or "Cups · Three". */
export function cardMeta(card: CardSummary, t: Translate): string {
  if (card.suit && card.rank !== null) {
    return `${t(suitLabelKey(card.suit))} · ${t(rankLabelKey(card.rank))}`;
  }
  return `${t('arcana.majorShort')} · ${card.numeral ?? ''}`;
}

/** The overline on Card Detail: "Major arcana · IX" or "Minor arcana · Cups". */
export function cardOverline(card: TarotCard, t: Translate, numeral: string | null): string {
  if (card.arcana === 'major') return `${t('arcana.major')} · ${numeral ?? ''}`;
  return `${t('arcana.minor')} · ${t(suitLabelKey(card.suit))}`;
}
