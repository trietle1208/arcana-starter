'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_DRAW_SETTINGS, drawReading } from '@/application/readings/drawReading';
import type { ReadingCard } from '@/application/readings/readingCards';
import { Notice } from '@/components/ui/Notice/Notice';
import {
  ReadingRitual,
  type RitualCard,
  type RitualStep,
} from '@/components/ui/ReadingRitual/ReadingRitual';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { getSpread, SPREADS } from '@/content/spreads';
import type { Reading } from '@/domain/records';
import { interpret } from '@/domain/tarot/interpret';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { ReadingMeanings, type MeaningItem } from './ReadingMeanings';
import styles from './ReadingRoom.module.css';

const DEFAULT_SPREAD_ID = 'three-card';
const HINT_ID = 'reading-hint';

/**
 * The Reading Room: pick a spread, then the ritual on the night table, then what each turned-over
 * card can mean in its position. Nothing is saved before Phase 3.
 *
 * The reading is drawn once, when the fan opens, by the reading engine. The ritual only decides
 * how the cards arrive: the n-th card chosen from the fan receives the n-th card drawn.
 */
export function ReadingRoom({ cards }: { cards: readonly ReadingCard[] }) {
  const t = useT();
  const { locale } = useLocale();
  const [spreadId, setSpreadId] = useState(DEFAULT_SPREAD_ID);
  const [step, setStep] = useState<RitualStep>('idle');
  const [reading, setReading] = useState<Reading | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);

  const spread = getSpread(spreadId);
  const cardsById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const cardOf = (id: string): ReadingCard => {
    const card = cardsById.get(id);
    if (!card) throw new Error(`Unknown card id "${id}"`);
    return card;
  };

  function chooseSpread(id: string) {
    // Changing the spread starts the ritual over: the ritual below is keyed on it.
    setSpreadId(id);
    setStep('idle');
    setReading(null);
    setRevealed([]);
  }

  function onStepChange(next: RitualStep) {
    setStep(next);
    if (next === 'shuffling') {
      setReading(null);
      setRevealed([]);
    }
    if (next === 'fan') setReading(drawReading(spreadId, DEFAULT_DRAW_SETTINGS));
  }

  const positions = spread.positions.map((position) => ({
    name: position.name[locale],
    prompt: position.prompt[locale],
    layout: position.layout,
  }));
  const ritualCards: RitualCard[] = (reading?.cards ?? []).map((drawn) => {
    const card = cardOf(drawn.cardId);
    return { src: card.image, name: card.name[locale], reversed: drawn.orientation === 'reversed' };
  });
  const meanings: MeaningItem[] = reading
    ? [...revealed]
        .sort((a, b) => a - b)
        .map((index) => ({
          n: index + 1,
          interpreted: interpret(reading.cards[index], cardOf(reading.cards[index].cardId), spread),
        }))
    : [];

  const count = spread.positions.length;
  const drawn = step === 'reveal' || step === 'done';
  const done = step === 'done';

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.titles}>
          <span className="ar-overline">{t('reading.eyebrow')}</span>
          <h1 className={`ar-h1 ${styles.title}`}>{t('reading.title')}</h1>
        </div>
        <SegmentedControl
          label={t('reading.spread.label')}
          options={SPREADS.map((option) => ({ value: option.id, label: option.name[locale] }))}
          value={spreadId}
          onChange={chooseSpread}
        />
      </header>

      <ReadingRitual
        key={spreadId}
        cards={ritualCards}
        positions={positions}
        grid={spread.grid}
        onStepChange={onStepChange}
        onReveal={(index) => setRevealed((now) => (now.includes(index) ? now : [...now, index]))}
        saveDisabled
        saveDescribedBy={HINT_ID}
        labels={{
          region: t('ritual.region'),
          idle: t('ritual.idle'),
          shuffling: t('ritual.shuffling'),
          cut: t('ritual.cut'),
          fan: t('ritual.fan'),
          fanOne: t('ritual.fanOne'),
          reveal: t('ritual.reveal'),
          done: t('ritual.done'),
          doneOne: t('ritual.doneOne'),
          shuffle: t('ritual.shuffle'),
          shuffleAgain: t('ritual.shuffleAgain'),
          save: t('ritual.save'),
          pileGroup: t('ritual.pileGroup'),
          pile: t('ritual.pile'),
        }}
        deckLabels={{ resting: t('ritual.deck.resting'), shuffling: t('ritual.deck.shuffling') }}
        fanLabels={{ group: t('ritual.fan.group'), card: t('ritual.fan.card') }}
        spreadLabels={{
          legend: t('spread.legend'),
          turnOver: t('spread.turnOver'),
          faceDown: t('spread.faceDown'),
          reversed: t('spread.reversed'),
        }}
        cardLabels={{
          faceDown: t('card.faceDown'),
          reversed: t('card.reversed'),
          altReversed: t('card.altReversed', { name: '{name}' }),
        }}
      />

      <div className={styles.below}>
        <div className={styles.notice}>
          {drawn ? (
            <Notice
              tone="info"
              title={
                count === 1 ? t('reading.drawn.titleOne') : t('reading.drawn.title', { count })
              }
            >
              {count === 1 ? t('reading.drawn.bodyOne') : t('reading.drawn.body')}
            </Notice>
          ) : null}
        </div>
        <p id={HINT_ID} className={styles.hint}>
          {done ? t('reading.save.unavailable') : t('reading.hint')}
        </p>
      </div>

      <ReadingMeanings items={meanings} locale={locale} t={t} />
    </div>
  );
}
