import { getCard } from '@/content';
import { getSpread } from '@/content/spreads';
import { JournalEntry } from '@/components/ui/JournalEntry/JournalEntry';
import { ButtonLink } from '@/components/ui/Button/ButtonLink';
import { Divider } from '@/components/ui/Divider/Divider';
import { excerptOf } from '@/domain/journal';
import type { JournalListItem } from '@/application/journal/journal';
import type { Locale } from '@/domain/tarot/types';
import { t } from '@/i18n';
import { dayOf, groupByMonth, monthHeading, shortMonth } from './format';
import styles from './JournalList.module.css';

/** A Celtic Cross has ten cards; the notebook card shows the first few so the text keeps its room. */
const MAX_THUMBNAILS = 5;

interface JournalListProps {
  /** The entries to show, newest first, after the filters. */
  items: readonly JournalListItem[];
  /** How many entries exist before filtering. */
  total: number;
  locale: Locale;
  now: Date;
}

/** The notebook cards of the journal, grouped by month. A Server Component. */
export function JournalList({ items, total, locale, now }: JournalListProps) {
  if (total === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={`ar-h2 ${styles.emptyTitle}`}>{t(locale, 'journal.empty.title')}</h2>
        <p className="ar-muted">{t(locale, 'journal.empty.body')}</p>
        <div className="ar-row">
          <ButtonLink href="/reading" variant="secondary">
            {t(locale, 'journal.empty.reading')}
          </ButtonLink>
          <ButtonLink href="/journal/new" variant="primary" icon="plus">
            {t(locale, 'journal.new')}
          </ButtonLink>
        </div>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={`ar-h2 ${styles.emptyTitle}`}>{t(locale, 'journal.noMatch.title')}</h2>
        <p className="ar-muted">{t(locale, 'journal.noMatch.hint')}</p>
        <div className="ar-row">
          <ButtonLink href="/journal" variant="secondary">
            {t(locale, 'journal.noMatch.clear')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const groups = groupByMonth(items, (item) => item.entry.createdAt);
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section
          key={group.key}
          className={styles.group}
          aria-label={monthHeading(group.date, locale, now)}
        >
          <span className="ar-overline">{monthHeading(group.date, locale, now)}</span>
          {group.items.map((item) => {
            const { entry } = item;
            const kind = item.spreadId
              ? getSpread(item.spreadId).name[locale]
              : entry.cardId
                ? t(locale, 'journal.kind.reflectionAbout', {
                    card: getCard(entry.cardId).name[locale],
                  })
                : t(locale, 'journal.kind.reflection');
            return (
              <JournalEntry
                key={entry.id}
                href={`/journal/${entry.id}`}
                day={dayOf(entry.createdAt)}
                month={shortMonth(entry.createdAt, locale)}
                spread={kind}
                title={entry.title}
                excerpt={excerptOf(entry.body) || undefined}
                tags={entry.tags}
                cards={item.cards
                  .slice(0, MAX_THUMBNAILS)
                  .map((card) => getCard(card.cardId).image)}
              />
            );
          })}
        </section>
      ))}
      <Divider variant="sprig" />
    </div>
  );
}
