'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { CardBack } from '../CardBack/CardBack';
import { CardFan, type CardFanLabels } from '../CardFan/CardFan';
import { NightSky } from '../NightSky/NightSky';
import { ShuffleDeck, type ShuffleDeckLabels } from '../ShuffleDeck/ShuffleDeck';
import {
  Spread,
  type SpreadCardView,
  type SpreadLabels,
  type SpreadPositionView,
} from '../Spread/Spread';
import type { TarotCardLabels } from '../TarotCard/TarotCard';
import { fill } from '../_shared/format';
import { prefersReducedMotion } from '../_shared/motion';
import type { CSSVars } from '../_shared/shapes';
import styles from './ReadingRitual.module.css';

export type RitualStep = 'idle' | 'shuffling' | 'cut' | 'fan' | 'reveal' | 'done';

export interface RitualCard {
  src?: string;
  name: string;
  reversed?: boolean;
}

export interface RitualLabels {
  /** Accessible name of the whole table. */
  region: string;
  idle: string;
  shuffling: string;
  cut: string;
  /** {chosen} and {need} are replaced. */
  fan: string;
  /** The same for a spread of one card. */
  fanOne: string;
  reveal: string;
  /** {need} is replaced. */
  done: string;
  doneOne: string;
  shuffle: string;
  shuffleAgain: string;
  save: string;
  pileGroup: string;
  /** {n} is replaced. */
  pile: string;
}

const DEFAULT_LABELS: RitualLabels = {
  region: 'Reading table',
  idle: 'Hold your question in mind, then shuffle the deck.',
  shuffling: 'Shuffling the deck…',
  cut: 'Cut the deck: choose one of the three piles.',
  fan: 'Choose {need} cards from the fan · {chosen} of {need} chosen',
  fanOne: 'Choose 1 card from the fan · {chosen} of 1 chosen',
  reveal: 'Turn each card over when you are ready.',
  done: 'All {need} cards are revealed.',
  doneOne: 'Your card is revealed.',
  shuffle: 'Shuffle the deck',
  shuffleAgain: 'Shuffle again',
  save: 'Save reading',
  pileGroup: 'Choose a pile',
  pile: 'Pile {n}',
};

export interface ReadingRitualProps {
  /**
   * The drawn cards in position order. A card is read only when it lands, so they may arrive
   * (from the reading engine) at any time before the first one is chosen.
   */
  cards: readonly RitualCard[];
  positions: readonly SpreadPositionView[];
  grid: { cols: number; rows: number };
  /** The reader's question, in starlight above the guidance line. */
  question?: string;
  /** How many cards the fan offers (21). */
  fanCount?: number;
  onSave?: () => void;
  saveDisabled?: boolean;
  /** Id of the element that says why saving is not possible. */
  saveDescribedBy?: string;
  /** Called on every step, once, from an event or a timer (never while rendering). */
  onStepChange?: (step: RitualStep) => void;
  /** Called with the position index of a card the reader has turned over. */
  onReveal?: (positionIndex: number) => void;
  onComplete?: () => void;
  /**
   * Where the ritual starts. 'reveal' and 'done' begin with every card already placed (and, for
   * 'done', turned), so a finished table can be rendered at once.
   */
  initialStep?: Exclude<RitualStep, 'shuffling'>;
  /** Scatters the stars; the same seed gives the same sky. */
  seed?: number;
  labels?: Partial<RitualLabels>;
  deckLabels?: Partial<ShuffleDeckLabels>;
  fanLabels?: Partial<CardFanLabels>;
  spreadLabels?: Partial<SpreadLabels>;
  cardLabels?: Partial<TarotCardLabels>;
  className?: string;
}

interface Flight {
  /** Position index the card is flying to. */
  slot: number;
  /** Centre of the fan card and of the target box, relative to the table. */
  x: number;
  y: number;
  tx: number;
  ty: number;
  /** Width of the fan card and of the target, in px. */
  w: number;
  tw: number;
  /** Tilt of the fan card, and how far the card ends turned (90 for a crossing card). */
  angle: number;
  rotateTo: number;
}

/** What to focus once it exists: the step's one obvious control, so the keyboard keeps its place. */
type FocusRequest =
  { kind: 'pile' } | { kind: 'fan'; near: number } | { kind: 'turn' } | { kind: 'again' };

const range = (count: number) => Array.from({ length: count }, (_, i) => i);

const SHUFFLE_MS = 2700;
const CUT_MS = 750;
const REVEAL_SETTLE_MS = 900;
const FLIGHT_MS = 750;

/**
 * The storybook ritual of a reading: shuffle → cut → fan → choose → place → reveal.
 *
 * The ritual only performs; it decides nothing. The cards that land are the `cards` it is given,
 * in position order: the n-th card chosen from the fan receives the n-th drawn card, whichever
 * fan card was tapped. Every step is a labelled button, and with reduced motion each step still
 * happens, instantly.
 */
export function ReadingRitual({
  cards,
  positions,
  grid,
  question,
  fanCount = 21,
  onSave,
  saveDisabled = false,
  saveDescribedBy,
  onStepChange,
  onReveal,
  onComplete,
  initialStep = 'idle',
  seed = 11,
  labels: labelOverrides,
  deckLabels,
  fanLabels,
  spreadLabels,
  cardLabels,
  className,
}: ReadingRitualProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const need = positions.length;
  const compact = need > 3;

  const [step, setStep] = useState<RitualStep>(initialStep);
  const placedAtStart = initialStep === 'reveal' || initialStep === 'done';
  // Fan indexes in the order they were chosen. A table that starts finished has no fan to ask.
  const [picked, setPicked] = useState<number[]>(() => (placedAtStart ? range(need) : []));
  const [revealed, setRevealed] = useState<number[]>(() =>
    initialStep === 'done' ? range(need) : [],
  );
  const [pile, setPile] = useState(-1);
  const [flight, setFlight] = useState<Flight | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const boxes = useRef<(HTMLDivElement | null)[]>([]);
  const flightRef = useRef<HTMLDivElement>(null);
  const landedSlot = useRef(-1);
  const focusRequest = useRef<FocusRequest | null>(null);

  // The parent's callbacks change every render; the timers below must call the latest ones.
  const callbacks = useRef({ onStepChange, onReveal, onComplete });
  useEffect(() => {
    callbacks.current = { onStepChange, onReveal, onComplete };
  });

  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = useCallback((action: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      action();
    }, ms);
    timers.current.add(id);
  }, []);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const goTo = useCallback((next: RitualStep) => {
    setStep(next);
    callbacks.current.onStepChange?.(next);
    if (next === 'cut') focusRequest.current = { kind: 'pile' };
    else if (next === 'fan') focusRequest.current = { kind: 'fan', near: -1 };
    else if (next === 'reveal') focusRequest.current = { kind: 'turn' };
    else if (next === 'done') focusRequest.current = { kind: 'again' };
    else focusRequest.current = null;
  }, []);

  function shuffle() {
    const reduced = prefersReducedMotion();
    setPicked([]);
    setRevealed([]);
    setFlight(null);
    setPile(-1);
    landedSlot.current = -1;
    goTo('shuffling');
    later(() => goTo('cut'), reduced ? 0 : SHUFFLE_MS);
  }

  function cut(index: number) {
    if (pile >= 0) return;
    setPile(index);
    later(() => goTo('fan'), prefersReducedMotion() ? 0 : CUT_MS);
  }

  function pick(fanIndex: number, element: HTMLButtonElement) {
    if (flight || picked.length >= need) return;
    const slot = picked.length;
    const next = [...picked, fanIndex];
    const target = boxes.current[slot];
    const table = tableRef.current;
    focusRequest.current = { kind: 'fan', near: fanIndex };

    if (prefersReducedMotion() || !table || !target) {
      setPicked(next);
      if (next.length === need) goTo('reveal');
      return;
    }
    // FLIP: measure where the card is and where it must land, fly a copy between the two.
    const table0 = table.getBoundingClientRect();
    const from = element.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    setPicked(next);
    setFlight({
      slot,
      x: from.left - table0.left + from.width / 2,
      y: from.top - table0.top + from.height / 2,
      tx: to.left - table0.left + to.width / 2,
      ty: to.top - table0.top + to.height / 2,
      w: element.offsetWidth,
      tw: target.offsetWidth,
      angle: parseFloat(element.style.getPropertyValue('--a')) || 0,
      rotateTo: positions[slot]?.layout.rotate ?? 0,
    });
  }

  // The flight starts at the fan card; one frame later it is sent to its place and the CSS
  // transition does the rest.
  useLayoutEffect(() => {
    const element = flightRef.current;
    if (!flight || !element) return;
    void element.getBoundingClientRect();
    element.style.transform =
      `translate(${flight.tx - flight.x}px, ${flight.ty - flight.y}px) ` +
      `rotate(${flight.rotateTo}deg) scale(${flight.tw / flight.w})`;
  }, [flight]);

  const land = useCallback(
    (arrived: Flight, total: number) => {
      if (landedSlot.current >= arrived.slot) return;
      landedSlot.current = arrived.slot;
      setFlight(null);
      if (arrived.slot + 1 === total) goTo('reveal');
    },
    [goTo],
  );
  // If the transition never reports back (a hidden tab, a card that did not move), land anyway.
  useEffect(() => {
    if (!flight) return;
    const id = setTimeout(() => land(flight, need), FLIGHT_MS + 450);
    return () => clearTimeout(id);
  }, [flight, land, need]);

  function reveal(index: number) {
    if (step !== 'reveal' || revealed.includes(index)) return;
    const next = [...revealed, index];
    setRevealed(next);
    callbacks.current.onReveal?.(index);
    focusRequest.current = { kind: 'turn' };
    if (next.length === need) {
      later(
        () => {
          goTo('done');
          callbacks.current.onComplete?.();
        },
        prefersReducedMotion() ? 0 : REVEAL_SETTLE_MS,
      );
    }
  }

  // Keyboard focus: when the control the reader just used goes away, move to the next one. Runs
  // after every render until the target exists (the fan opens after the cut finishes).
  useEffect(() => {
    const request = focusRequest.current;
    const table = tableRef.current;
    if (!request || !table) return;
    let target: HTMLElement | null = null;
    if (request.kind === 'pile') {
      target = table.querySelector<HTMLElement>('[data-pile]:not(:disabled)');
    } else if (request.kind === 'fan') {
      const open = Array.from(table.querySelectorAll<HTMLElement>('[data-fan-index]')).filter(
        (el) => !(el as HTMLButtonElement).disabled,
      );
      const index = (el: HTMLElement) => Number(el.dataset.fanIndex);
      target = open.find((el) => index(el) > request.near) ?? open[open.length - 1] ?? null;
    } else if (request.kind === 'turn') {
      target = table.querySelector<HTMLElement>('[data-slot] button');
    } else {
      target = table.querySelector<HTMLElement>('[data-again]');
    }
    if (target) {
      focusRequest.current = null;
      target.focus();
    }
  });
  // If the reader moves on to something outside the table, stop trying to steer them.
  useEffect(() => {
    const drop = (event: FocusEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        focusRequest.current = null;
      }
    };
    document.addEventListener('focusin', drop);
    return () => document.removeEventListener('focusin', drop);
  }, []);

  const placed = picked.length - (flight ? 1 : 0);
  const slotCards: (SpreadCardView | null)[] = positions.map((_, i) => {
    const card = i < placed ? cards[i] : undefined;
    return card ? { ...card, revealed: revealed.includes(i) } : null;
  });

  const copy =
    step === 'fan'
      ? fill(need === 1 ? labels.fanOne : labels.fan, { chosen: picked.length, need })
      : step === 'done'
        ? fill(need === 1 ? labels.doneOne : labels.done, { need })
        : step === 'shuffling'
          ? labels.shuffling
          : labels[step];

  const deckOnTable = step === 'idle' || step === 'shuffling';

  return (
    <NightSky
      className={[styles.ritual, className].filter(Boolean).join(' ')}
      seed={seed}
      stars={46}
      label={labels.region}
    >
      <div className={styles.table} ref={tableRef} data-step={step}>
        <header className={styles.head}>
          {question ? <h2 className={styles.question}>{question}</h2> : null}
          <p className={styles.copy} aria-live="polite">
            {copy}
          </p>
        </header>

        {/* The stage keeps its height in every step, so nothing below it ever moves. */}
        <div
          className={[styles.stage, step === 'fan' && styles.stageFan].filter(Boolean).join(' ')}
        >
          {deckOnTable ? (
            <ShuffleDeck shuffling={step === 'shuffling'} labels={deckLabels} />
          ) : null}
          {step === 'cut' ? (
            <div
              className={styles.cut}
              role="group"
              aria-label={labels.pileGroup}
              style={{ '--chosen': pile } as CSSVars}
            >
              {[0, 1, 2].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={[
                    styles.pile,
                    styles[`pile${k}`],
                    pile === k && styles.chosen,
                    pile >= 0 && pile !== k && styles.gathered,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-pile={k + 1}
                  disabled={pile >= 0}
                  aria-label={fill(labels.pile, { n: k + 1 })}
                  onClick={() => cut(k)}
                >
                  {[0, 1, 2, 3].map((j) => {
                    const style: CSSVars = { '--j': j };
                    return (
                      <div key={j} className={styles.pileCard} style={style}>
                        <CardBack />
                      </div>
                    );
                  })}
                </button>
              ))}
            </div>
          ) : null}
          {step === 'fan' ? (
            <CardFan
              className={styles.fan}
              count={fanCount}
              taken={picked}
              onPick={pick}
              disabled={flight !== null}
              labels={fanLabels}
            />
          ) : null}
        </div>

        <div className={styles.spread}>
          <Spread
            tone="night"
            positions={positions}
            grid={grid}
            cards={slotCards}
            waiting={step === 'reveal'}
            onCardClick={step === 'reveal' ? reveal : undefined}
            cardWidth={compact ? 'clamp(56px, 7vw, 76px)' : undefined}
            cardRef={(i, element) => {
              boxes.current[i] = element;
            }}
            labels={spreadLabels}
            cardLabels={cardLabels}
          />
        </div>

        <div className={styles.actions}>
          {step === 'idle' ? (
            <Button variant="gold" icon="shuffle" onClick={shuffle}>
              {labels.shuffle}
            </Button>
          ) : null}
          {step === 'done' ? (
            <>
              <Button variant="night" icon="shuffle" onClick={shuffle} data-again="">
                {labels.shuffleAgain}
              </Button>
              <Button
                variant="gold"
                icon="bookmark"
                onClick={onSave}
                disabled={saveDisabled}
                aria-describedby={saveDisabled ? saveDescribedBy : undefined}
              >
                {labels.save}
              </Button>
            </>
          ) : null}
        </div>

        {flight ? (
          <div
            ref={flightRef}
            className={styles.flight}
            onTransitionEnd={(event) => {
              if (event.target === event.currentTarget && event.propertyName === 'transform') {
                land(flight, need);
              }
            }}
            style={flightStyle(flight)}
            aria-hidden="true"
          >
            <div className={styles.flightInner}>
              <CardBack />
            </div>
          </div>
        ) : null}
      </div>
    </NightSky>
  );
}

function flightStyle(flight: Flight): CSSVars {
  return {
    left: flight.x - flight.w / 2,
    // A card is 511/284 tall: its centre sits 0.9 widths below its top.
    top: flight.y - flight.w * 0.9,
    width: flight.w,
    transform: `rotate(${flight.angle}deg)`,
  };
}
