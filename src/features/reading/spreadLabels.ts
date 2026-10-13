import type { SpreadLabels } from '@/components/ui/Spread/Spread';
import type { TarotCardLabels } from '@/components/ui/TarotCard/TarotCard';
import type { TranslationKey, TranslationParams } from '@/i18n';

type T = (key: TranslationKey, params?: TranslationParams) => string;

/** The words the Spread renderer needs, in the reader's language. */
export function spreadLabels(t: T): SpreadLabels {
  return {
    legend: t('spread.legend'),
    turnOver: t('spread.turnOver'),
    faceDown: t('spread.faceDown'),
    reversed: t('spread.reversed'),
  };
}

/** The words a TarotCard needs; `{name}` stays for the card to fill. */
export function cardLabels(t: T): Partial<TarotCardLabels> {
  return {
    faceDown: t('card.faceDown'),
    reversed: t('card.reversed'),
    altReversed: t('card.altReversed', { name: '{name}' }),
  };
}
