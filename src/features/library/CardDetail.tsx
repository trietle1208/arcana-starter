'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Divider } from '@/components/ui/Divider/Divider';
import { Icon } from '@/components/ui/Icon/Icon';
import { MeaningPanel } from '@/components/ui/MeaningPanel/MeaningPanel';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { TarotCard } from '@/components/ui/TarotCard/TarotCard';
import { TextField } from '@/components/ui/TextField/TextField';
import { romanNumeral } from '@/domain/tarot/deck';
import { isPlaceholder, withoutPlaceholders } from '@/domain/tarot/placeholder';
import type { Orientation, TarotCard as Card } from '@/domain/tarot/types';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cardOverline } from './cardLabels';
import styles from './CardDetail.module.css';

/** Card Detail: a reference-book page for one card, in the reader's language. */
export function CardDetail({ card }: { card: Card }) {
  const t = useT();
  const { locale } = useLocale();
  const [orientation, setOrientation] = useState<Orientation>('upright');

  const name = card.name[locale];
  const intro = card.intro[locale];
  const numeral = card.arcana === 'major' ? romanNumeral(card.number) : null;
  const questions = withoutPlaceholders(card.reflectionQuestions[locale]);
  const [prompt, ...moreQuestions] = questions;

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
            <TextField
              multiline
              rows={3}
              label={t('reflect.notes.label')}
              placeholder={t('reflect.notes.placeholder')}
            />
            <div className={styles.actions}>
              <Button variant="primary" icon="bookmark" disabled>
                {t('reflect.save')}
              </Button>
              <span className="ar-hint">{t('reflect.save.unavailable')}</span>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
