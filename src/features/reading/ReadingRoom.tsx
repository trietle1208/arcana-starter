'use client';

import { useMemo, useState } from 'react';
import { drawReading } from '@/application/readings/drawReading';
import type { ReadingCard } from '@/application/readings/readingCards';
import { ButtonLink } from '@/components/ui/Button/ButtonLink';
import { Notice } from '@/components/ui/Notice/Notice';
import {
  ReadingRitual,
  type RitualCard,
  type RitualStep,
} from '@/components/ui/ReadingRitual/ReadingRitual';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { getSpread, SPREADS } from '@/content/spreads';
import type { Reading, UserSettings } from '@/domain/records';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { interpret } from '@/domain/tarot/interpret';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { ReadingMeanings, type MeaningItem } from './ReadingMeanings';
import { SaveReadingForm } from './SaveReadingForm';
import { cardLabels, spreadLabels } from './spreadLabels';
import styles from './ReadingRoom.module.css';

const HINT_ID = 'reading-hint';

/** The settings the room depends on. */
export type ReadingRoomSettings = Pick<
  UserSettings,
  'includeReversed' | 'revealOneByOne' | 'defaultSpreadId' | 'interpretationDetail'
>;

/**
 * The Reading Room: pick a spread, then the ritual on the night table, then what each turned-over
 * card can mean in its position. A finished reading can be saved to the journal; until then
 * nothing is stored.
 *
 * The reading is drawn once, when the fan opens, by the reading engine. The ritual only decides
 * how the cards arrive: the n-th card chosen from the fan receives the n-th card drawn.
 */
export function ReadingRoom({
  cards,
  settings = DEFAULT_SETTINGS,
}: {
  cards: readonly ReadingCard[];
  settings?: ReadingRoomSettings;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [spreadId, setSpreadId] = useState(settings.defaultSpreadId);
  const [step, setStep] = useState<RitualStep>('idle');
  const [reading, setReading] = useState<Reading | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

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
    setFormOpen(false);
    setSavedEntryId(null);
  }

  function onStepChange(next: RitualStep) {
    setStep(next);
    if (next === 'shuffling') {
      setReading(null);
      setRevealed([]);
      setFormOpen(false);
      setSavedEntryId(null);
    }
    if (next === 'fan') {
      setReading(drawReading(spreadId, { includeReversed: settings.includeReversed }));
    }
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
        revealMode={settings.revealOneByOne ? 'one-by-one' : 'all'}
        onSave={() => setFormOpen(true)}
        saveDisabled={savedEntryId !== null}
        saveDescribedBy={savedEntryId !== null ? HINT_ID : undefined}
        labels={{
          region: t('ritual.region'),
          idle: t('ritual.idle'),
          shuffling: t('ritual.shuffling'),
          cut: t('ritual.cut'),
          fan: t('ritual.fan'),
          fanOne: t('ritual.fanOne'),
          reveal: t('ritual.reveal'),
          revealAll: t('ritual.revealAll'),
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
        spreadLabels={spreadLabels(t)}
        cardLabels={cardLabels(t)}
      />

      <div className={styles.below}>
        <div className={styles.notice}>
          {savedEntryId !== null ? (
            <Notice
              tone="success"
              title={t('save.done.title')}
              action={
                <ButtonLink href={`/journal/${savedEntryId}`} variant="secondary" size="sm">
                  {t('save.done.open')}
                </ButtonLink>
              }
            >
              {t('save.done.body')}
            </Notice>
          ) : drawn ? (
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
          {done
            ? savedEntryId !== null
              ? t('reading.saved.hint')
              : t('reading.save.hint')
            : t('reading.hint')}
        </p>
      </div>

      {formOpen && reading && savedEntryId === null ? (
        <SaveReadingForm
          key={reading.id}
          reading={reading}
          defaultTitle={ritualCards[0]?.name ?? ''}
          onSaved={(entryId) => {
            setSavedEntryId(entryId);
            setFormOpen(false);
          }}
          onCancel={() => setFormOpen(false)}
        />
      ) : null}

      <ReadingMeanings
        items={meanings}
        locale={locale}
        detail={settings.interpretationDetail}
        t={t}
      />
    </div>
  );
}
