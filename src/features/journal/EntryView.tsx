'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition, type FormEvent } from 'react';
import type { JournalSnapshot } from '@/application/journal/journal';
import type { ReadingCard } from '@/application/readings/readingCards';
import { Button } from '@/components/ui/Button/Button';
import { ButtonLink } from '@/components/ui/Button/ButtonLink';
import { Icon } from '@/components/ui/Icon/Icon';
import { Notice } from '@/components/ui/Notice/Notice';
import { Spread } from '@/components/ui/Spread/Spread';
import { Tag } from '@/components/ui/Tag/Tag';
import { TarotCard } from '@/components/ui/TarotCard/TarotCard';
import { getSpread } from '@/content/spreads';
import { splitTagInput } from '@/domain/journal';
import type { InterpretationDetail, JournalEntry, Reading } from '@/domain/records';
import { interpret } from '@/domain/tarot/interpret';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import type { UiError } from '../actionResult';
import { ReadingMeanings, type MeaningItem } from '../reading/ReadingMeanings';
import { cardLabels, spreadLabels } from '../reading/spreadLabels';
import { deleteEntryAction, restoreEntryAction, updateEntryAction } from './actions';
import { EntryFields } from './EntryFields';
import { longDate } from './format';
import styles from './EntryView.module.css';

/** How long Undo stays on offer after a delete. */
const UNDO_MS = 8000;

interface EntryViewProps {
  entry: JournalEntry;
  reading: Reading | null;
  /** The cards of the reading (or the one the reflection is about), with their texts. */
  cards: readonly ReadingCard[];
  detail: InterpretationDetail;
}

/**
 * One journal entry: the spread it was drawn in with what each card says, and the reader's own
 * notes to edit. Deleting is immediate, with a short Undo that puts the same rows back.
 */
export function EntryView({ entry, reading, cards, detail }: EntryViewProps) {
  const t = useT();
  const { locale } = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<UiError | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState<JournalSnapshot | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);

  const cardsById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const spread = reading ? getSpread(reading.spreadId) : null;
  const aboutCard = !reading && entry.cardId ? (cardsById.get(entry.cardId) ?? null) : null;

  // The Undo offer lapses on its own.
  useEffect(() => {
    if (!undoOpen) return;
    const id = setTimeout(() => setUndoOpen(false), UNDO_MS);
    return () => clearTimeout(id);
  }, [undoOpen]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateEntryAction({
        id: entry.id,
        title: String(data.get('title') ?? ''),
        body: String(data.get('body') ?? ''),
        tags: splitTagInput(String(data.get('tags') ?? '')),
      });
      if (result.ok) setSaved(true);
      else setError(result.error);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteEntryAction(entry.id);
      if (result.ok) {
        setDeleted(result.snapshot);
        setUndoOpen(true);
      } else {
        setError(result.error);
      }
    });
  }

  function undo() {
    if (!deleted) return;
    startTransition(async () => {
      const result = await restoreEntryAction(deleted);
      if (result.ok) {
        setDeleted(null);
        setUndoOpen(false);
        setSaved(false);
      } else {
        setError(result.error);
      }
    });
  }

  if (deleted) {
    return (
      <div className={styles.page}>
        <div className={styles.deleted}>
          <Notice
            tone="success"
            title={t('entry.deleted.title')}
            action={
              undoOpen ? (
                <Button variant="secondary" size="sm" onClick={undo} disabled={pending}>
                  {t('entry.deleted.button')}
                </Button>
              ) : null
            }
          >
            {undoOpen ? t('entry.deleted.undo') : t('entry.deleted.gone')}
          </Notice>
          {error ? (
            <p role="alert" className={styles.error}>
              {t(error === 'storage' ? 'error.storage' : 'error.notFound')}
            </p>
          ) : null}
          <ButtonLink href="/journal" variant="quiet">
            {t('entry.deleted.back')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const items: MeaningItem[] =
    reading && spread
      ? reading.cards.flatMap((drawn, index) => {
          const card = cardsById.get(drawn.cardId);
          return card ? [{ n: index + 1, interpreted: interpret(drawn, card, spread) }] : [];
        })
      : [];

  const when = longDate(entry.createdAt, locale);
  const overline = spread
    ? t('entry.spread', { spread: spread.name[locale], date: when })
    : t('entry.written', { date: when });

  return (
    <div className={styles.page}>
      <Link href="/journal" className={styles.back} prefetch={false}>
        <Icon name="arrow" size={14} />
        {t('entry.back')}
      </Link>

      <header className={styles.head}>
        <span className="ar-overline">{overline}</span>
        <h1 className={`ar-h1 ${styles.title}`}>{entry.title}</h1>
        {entry.tags.length > 0 ? (
          <div className={styles.tags}>
            {entry.tags.map((tag) => (
              <Tag key={tag} tone="rose">
                {tag}
              </Tag>
            ))}
          </div>
        ) : null}
        {entry.prompt ? (
          <p className={styles.prompt}>
            <span className="ar-overline">{t('entry.prompt')}</span>
            <span>{entry.prompt}</span>
          </p>
        ) : null}
      </header>

      {reading && spread ? (
        <div className={styles.spread}>
          <Spread
            tone="paper"
            positions={spread.positions.map((position) => ({
              name: position.name[locale],
              prompt: position.prompt[locale],
              layout: position.layout,
            }))}
            grid={spread.grid}
            cards={reading.cards.map((drawn) => {
              const card = cardsById.get(drawn.cardId);
              return {
                src: card?.image,
                name: card?.name[locale] ?? drawn.cardId,
                reversed: drawn.orientation === 'reversed',
              };
            })}
            labels={spreadLabels(t)}
            cardLabels={cardLabels(t)}
          />
        </div>
      ) : null}

      {aboutCard ? (
        <Link href={`/library/${aboutCard.id}`} className={styles.about} prefetch={false}>
          <TarotCard
            src={aboutCard.image}
            name={aboutCard.name[locale]}
            size="sm"
            labels={cardLabels(t)}
          />
          <span>{t('entry.aboutCard', { card: aboutCard.name[locale] })}</span>
        </Link>
      ) : null}

      {items.length > 0 ? (
        <ReadingMeanings items={items} locale={locale} detail={detail} t={t} />
      ) : null}

      <section className={styles.notes} aria-labelledby="entry-notes-title">
        <h2 id="entry-notes-title" className={`ar-h2 ${styles.notesTitle}`}>
          {t('entry.notes.title')}
        </h2>
        <form
          className={styles.form}
          onSubmit={save}
          onChange={() => setSaved(false)}
          noValidate
          aria-busy={pending}
        >
          <EntryFields
            idPrefix="entry"
            defaults={{ title: entry.title, body: entry.body, tags: entry.tags.join(', ') }}
            error={error}
          />
          <div className={styles.actions}>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? t('entry.saving') : t('entry.save')}
            </Button>
            <span role="status" className={styles.saved}>
              {saved ? t('entry.saved') : ''}
            </span>
          </div>
        </form>
      </section>

      <div className={styles.danger}>
        <Button variant="quiet" icon="x" onClick={remove} disabled={pending}>
          {t('entry.delete')}
        </Button>
      </div>
    </div>
  );
}
