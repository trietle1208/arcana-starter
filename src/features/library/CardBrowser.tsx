'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  EMPTY_CARD_QUERY,
  parseCardQuery,
  serializeCardQuery,
  type CardQuery,
  type CardSort,
} from '@/application/cards/cardQuery';
import type { CardSummary } from '@/application/cards/cardSummaries';
import { searchCards } from '@/application/cards/searchCards';
import { Button } from '@/components/ui/Button/Button';
import { CardTile } from '@/components/ui/CardTile/CardTile';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { Tag } from '@/components/ui/Tag/Tag';
import { TextField } from '@/components/ui/TextField/TextField';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cardMeta } from './cardLabels';
import { filterOf, LIBRARY_FILTERS, withFilter } from './filters';
import { LibraryTitles } from './LibraryTitles';
import styles from './CardBrowser.module.css';

const SEARCH_ID = 'library-search';
const TILE_SIZES =
  '(min-width: 1200px) 180px, (min-width: 1024px) 22vw, (min-width: 560px) 30vw, 46vw';

/**
 * The card library: search, filter chips, sort and the grid. The query lives in the URL
 * (?q=&arcana=&suit=&sort=), written with history.replaceState so typing never refetches the
 * page; the 78 cards are filtered in memory.
 */
export function CardBrowser({ cards }: { cards: CardSummary[] }) {
  const t = useT();
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const urlQuery = useMemo(() => parseCardQuery(searchParams), [searchParams]);

  // The search box shows what was typed straight away; the URL catches up a moment later. When
  // the URL changes from elsewhere (a nav link, back and forward) the box follows it, but never
  // while the reader is typing, or a slower URL update would undo their last keystrokes.
  const [text, setText] = useState(urlQuery.q);
  const [seenQuery, setSeenQuery] = useState(urlQuery.q);
  if (seenQuery !== urlQuery.q) {
    setSeenQuery(urlQuery.q);
    const typing = typeof document !== 'undefined' && document.activeElement?.id === SEARCH_ID;
    if (!typing) setText(urlQuery.q);
  }

  const results = useMemo(
    () => searchCards(cards, { ...urlQuery, q: text }, locale),
    [cards, urlQuery, text, locale],
  );

  function update(next: CardQuery) {
    const queryString = serializeCardQuery(next);
    window.history.replaceState(
      null,
      '',
      queryString ? `?${queryString}` : window.location.pathname,
    );
  }

  const current: CardQuery = { ...urlQuery, q: text };
  const activeFilter = filterOf(urlQuery);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <LibraryTitles total={cards.length} />
        <div className={styles.search}>
          <TextField
            id={SEARCH_ID}
            label={t('library.search.label')}
            placeholder={t('library.search.placeholder')}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              update({ ...urlQuery, q: event.target.value });
            }}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.chips} role="group" aria-label={t('library.filter.label')}>
          {LIBRARY_FILTERS.map((filter) => (
            <Tag
              key={filter.id}
              selected={activeFilter === filter.id}
              onClick={() => update(withFilter(current, filter.id))}
            >
              {t(filter.label)}
            </Tag>
          ))}
        </div>
        <div className={styles.tools}>
          <SegmentedControl
            label={t('library.sort.label')}
            options={[
              { value: 'number', label: t('library.sort.number') },
              { value: 'name', label: t('library.sort.name') },
            ]}
            value={urlQuery.sort}
            onChange={(sort) => update({ ...current, sort: sort as CardSort })}
          />
          <span className="ar-hint" role="status">
            {t('library.showing', { shown: results.length, total: cards.length })}
          </span>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className={styles.grid}>
          {results.map((card, index) => (
            <li key={card.id}>
              <CardTile
                href={`/library/${card.id}`}
                src={card.image}
                name={card.name[locale]}
                meta={cardMeta(card, t)}
                numeral={card.numeral ?? undefined}
                keywords={card.keywords[locale].slice(0, 1)}
                sizes={TILE_SIZES}
                priority={index < 5}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty} role="status">
          <p className={styles.emptyTitle}>{t('library.empty.title')}</p>
          <p className={`ar-muted ${styles.emptyHint}`}>{t('library.empty.hint')}</p>
          <Button
            onClick={() => {
              setText('');
              update({ ...EMPTY_CARD_QUERY, sort: urlQuery.sort });
            }}
          >
            {t('library.empty.clear')}
          </Button>
        </div>
      )}
    </div>
  );
}
