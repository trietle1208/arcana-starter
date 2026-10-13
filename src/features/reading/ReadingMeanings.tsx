import type { ReadingCard } from '@/application/readings/readingCards';
import { Tag } from '@/components/ui/Tag/Tag';
import type { InterpretedCard } from '@/domain/tarot/interpret';
import type { Locale } from '@/domain/tarot/types';
import type { TranslationKey, TranslationParams } from '@/i18n';
import styles from './ReadingMeanings.module.css';

export interface MeaningItem {
  /** 1-based position number, as printed on the table. */
  n: number;
  interpreted: InterpretedCard<ReadingCard>;
}

interface ReadingMeaningsProps {
  /** The cards turned over so far, in position order. */
  items: readonly MeaningItem[];
  locale: Locale;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

/** Below the table: for every card turned over, its position, then what it can mean there. */
export function ReadingMeanings({ items, locale, t }: ReadingMeaningsProps) {
  if (items.length === 0) return null;
  return (
    <section className={styles.meanings} aria-labelledby="reading-meanings-title">
      <header className={styles.head}>
        <h2 id="reading-meanings-title" className={`ar-h2 ${styles.title}`}>
          {t('reading.meanings.title')}
        </h2>
        <p className={`ar-muted ${styles.intro}`}>{t('reading.meanings.intro')}</p>
      </header>
      <ol className={styles.list}>
        {items.map(({ n, interpreted: { position, card, orientation, meaning } }) => (
          <li key={n} className={styles.item} data-position={n}>
            <span className="ar-overline">
              {t('reading.meanings.position', { n, name: position.name[locale] })}
            </span>
            <p className={styles.prompt}>{position.prompt[locale]}</p>
            <h3 className={`ar-h3 ${styles.card}`}>
              {card.name[locale]}
              <span className={styles.orientation}>
                {orientation === 'reversed' ? t('meaning.reversed') : t('meaning.upright')}
              </span>
            </h3>
            <div className={styles.keys}>
              {meaning.keywords[locale].map((keyword) => (
                <Tag key={keyword}>{keyword}</Tag>
              ))}
            </div>
            <p className={styles.summary}>{meaning.summary[locale]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
