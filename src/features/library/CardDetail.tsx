'use client';

import Link from 'next/link';
import { useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Divider } from '@/components/ui/Divider/Divider';
import { ButtonLink } from '@/components/ui/Button/ButtonLink';
import { Icon } from '@/components/ui/Icon/Icon';
import { MeaningPanel } from '@/components/ui/MeaningPanel/MeaningPanel';
import { Notice } from '@/components/ui/Notice/Notice';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { TarotCard } from '@/components/ui/TarotCard/TarotCard';
import { TextField } from '@/components/ui/TextField/TextField';
import { romanNumeral } from '@/domain/tarot/deck';
import { isPlaceholder, withoutPlaceholders } from '@/domain/tarot/placeholder';
import type { Orientation, TarotCard as Card } from '@/domain/tarot/types';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { UI_ERROR_KEY, type UiError } from '../actionResult';
import { createReflectionAction } from '../journal/actions';
import { cardOverline } from './cardLabels';
import styles from './CardDetail.module.css';

/** Card Detail: a reference-book page for one card, in the reader's language. */
export function CardDetail({ card }: { card: Card }) {
  const t = useT();
  const { locale } = useLocale();
  const [orientation, setOrientation] = useState<Orientation>('upright');
  const [notes, setNotes] = useState('');
  const [saving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<UiError | 'empty' | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  const name = card.name[locale];
  const intro = card.intro[locale];
  const numeral = card.arcana === 'major' ? romanNumeral(card.number) : null;
  const questions = withoutPlaceholders(card.reflectionQuestions[locale]);
  const [prompt, ...moreQuestions] = questions;

  function saveReflection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (notes.trim() === '') {
      setSaveError('empty');
      return;
    }
    setSaveError(null);
    setSavedEntryId(null);
    startSaving(async () => {
      const result = await createReflectionAction({
        title: name,
        body: notes,
        prompt: prompt ?? null,
        cardId: card.id,
      });
      if (result.ok) {
        setSavedEntryId(result.entryId);
        setNotes('');
      } else {
        setSaveError(result.error);
      }
    });
  }

  return (
    <>
      <Link href="/library" className={styles.back} prefetch={false}>
        <Icon name="arrow" size={14} />
        {t('detail.back')}
      </Link>

      <div className={styles.layout}>
        <div className={styles.side}>
          <TarotCard
            src={card.image}
            name={name}
            numeral={numeral ?? undefined}
            size="lg"
            reversed={orientation === 'reversed'}
            className={styles.card}
            sizes="300px"
            priority
            labels={{ altReversed: t('card.altReversed', { name }) }}
          />
          <SegmentedControl
            label={t('detail.orientation.label')}
            options={[
              { value: 'upright', label: t('detail.orientation.upright') },
              { value: 'reversed', label: t('detail.orientation.reversed') },
            ]}
            value={orientation}
            onChange={(value) => setOrientation(value as Orientation)}
          />
        </div>

        <article className={styles.article}>
          <span className="ar-overline">{cardOverline(card, t, numeral)}</span>
          <h1 className={`ar-h1 ${styles.title}`}>{name}</h1>
          {isPlaceholder(intro) ? (
            <p className={`${styles.intro} ${styles.pending}`}>{t('card.pending')}</p>
          ) : (
            <p className={styles.intro}>{intro}</p>
          )}
          <Divider />
          <MeaningPanel
            headingLevel={2}
            keywords={withoutPlaceholders(card.keywords[locale])}
            upright={card.meanings.upright.summary[locale]}
            reversed={card.meanings.reversed.summary[locale]}
            symbolism={card.symbolism[locale]}
            labels={{
              upright: t('meaning.upright'),
              reversed: t('meaning.reversed'),
              symbolism: t('meaning.symbolism'),
            }}
            isPending={isPlaceholder}
            pendingText={t('card.pending')}
          />
          <Divider variant="sprig" />
          <section className={styles.reflect} aria-labelledby="reflect-title">
            <h2 id="reflect-title" className={`ar-h2 ${styles.reflectTitle}`}>
              {t('reflect.title')}
            </h2>
            {prompt ? (
              <p className={styles.prompt}>{prompt}</p>
            ) : (
              <p className={`${styles.prompt} ${styles.pending}`}>{t('card.pending')}</p>
            )}
            {moreQuestions.length > 0 ? (
              <div className={styles.more}>
                <span className="ar-hint">{t('reflect.more')}</span>
                <ul className={styles.moreList}>
                  {moreQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <form className={styles.form} onSubmit={saveReflection} noValidate aria-busy={saving}>
              <TextField
                multiline
                rows={3}
                name="notes"
                label={t('reflect.notes.label')}
                placeholder={t('reflect.notes.placeholder')}
                value={notes}
                maxLength={20000}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setSaveError(null);
                }}
                error={
                  saveError === 'empty'
                    ? t('reflect.notes.empty')
                    : saveError
                      ? t(UI_ERROR_KEY[saveError])
                      : undefined
                }
              />
              <div className={styles.actions}>
                <Button type="submit" variant="primary" icon="bookmark" disabled={saving}>
                  {saving ? t('reflect.saving') : t('reflect.save')}
                </Button>
              </div>
              {savedEntryId ? (
                <Notice
                  tone="success"
                  title={t('reflect.saved.title')}
                  action={
                    <ButtonLink href={`/journal/${savedEntryId}`} variant="secondary" size="sm">
                      {t('reflect.saved.open')}
                    </ButtonLink>
                  }
                >
                  {t('reflect.saved.body')}
                </Notice>
              ) : null}
            </form>
          </section>
        </article>
      </div>
    </>
  );
}
