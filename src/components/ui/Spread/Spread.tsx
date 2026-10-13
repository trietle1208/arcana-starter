import type { CSSProperties } from 'react';
import { fill } from '../_shared/format';
import type { CSSVars } from '../_shared/shapes';
import { TarotCard, type TarotCardLabels } from '../TarotCard/TarotCard';
import styles from './Spread.module.css';

/** One position of the spread, already in the reader's language. */
export interface SpreadPositionView {
  name: string;
  prompt: string;
  /** 1-based cell on the grid; a row may end in .5 to sit half a card lower. */
  layout: { col: number; row: number; rotate?: 0 | 90 };
}

export interface SpreadCardView {
  src?: string;
  name: string;
  reversed?: boolean;
  /** Face up when true or left out; false lays the card face down. */
  revealed?: boolean;
}

export interface SpreadLabels {
  /** Accessible name of the legend list. */
  legend: string;
  /** Face-down card that can be turned; {n} and {name} (the position) are replaced. */
  turnOver: string;
  /** Face-down card that cannot be turned yet. */
  faceDown: string;
  /** Appended to the name of a reversed card. */
  reversed: string;
}

const DEFAULT_LABELS: SpreadLabels = {
  legend: 'Positions',
  turnOver: 'Position {n}, {name} — select to turn over',
  faceDown: 'Position {n}, {name}: face down',
  reversed: 'reversed',
};

export interface SpreadProps {
  positions: readonly SpreadPositionView[];
  grid: { cols: number; rows: number };
  /** One entry per position; null or undefined leaves the position empty (a dashed outline). */
  cards?: readonly (SpreadCardView | null | undefined)[];
  /** The position being read: outlined, and its legend row is tinted. */
  current?: number;
  /** Makes face-down cards turnable. Called with the position index. */
  onCardClick?: (index: number) => void;
  /** Turnable cards pulse a soft gold halo (night only). */
  waiting?: boolean;
  /**
   * roomy: large cards, each with its position beneath (one to three cards).
   * compact: small cards and a numbered legend (the Celtic Cross).
   * Defaults to compact for more than three positions.
   */
  density?: 'roomy' | 'compact';
  tone?: 'paper' | 'night';
  /** Show the numbered legend (compact only; default true). */
  legend?: boolean;
  /** Width of a card as a CSS length, e.g. 'clamp(56px, 7vw, 76px)'. */
  cardWidth?: string;
  /** Gives the caller the box of each card, to fly a card there. */
  cardRef?: (index: number, element: HTMLDivElement | null) => void;
  labels?: Partial<SpreadLabels>;
  cardLabels?: Partial<TarotCardLabels>;
  className?: string;
}

/**
 * Lays cards out on a named spread, from data: each position says its own cell, so a new spread
 * needs no new UI. Positions sharing a cell lie across each other when one is rotated.
 */
export function Spread({
  positions,
  grid,
  cards = [],
  current,
  onCardClick,
  waiting = false,
  density,
  tone = 'paper',
  legend = true,
  cardWidth,
  cardRef,
  labels: labelOverrides,
  cardLabels,
  className,
}: SpreadProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const compact = (density ?? (positions.length > 3 ? 'compact' : 'roomy')) === 'compact';
  // A fractional row needs a finer grid: every card then spans two half rows.
  const halfRows = positions.some((position) => !Number.isInteger(position.layout.row));

  const layoutStyle: CSSVars = {
    gridTemplateColumns: `repeat(${grid.cols}, ${compact ? 'var(--cw)' : 'auto'})`,
    ...(halfRows
      ? { gridTemplateRows: `repeat(${grid.rows * 2}, calc((var(--ch) + var(--row-gap)) / 2))` }
      : {}),
  };
  const rootStyle: CSSVars = cardWidth ? { '--cw': cardWidth } : {};

  function slot(i: number) {
    const position = positions[i];
    const card = cards[i] ?? null;
    const state = !card ? 'empty' : card.revealed === false ? 'down' : 'up';
    const turnable = state === 'down' && onCardClick !== undefined;
    const n = i + 1;
    const rotated = position.layout.rotate === 90;
    const place: CSSProperties = {
      gridColumn: position.layout.col,
      gridRow: halfRows ? `${position.layout.row * 2 - 1} / span 2` : position.layout.row,
    };
    const cardName = card ? card.name : '';
    const shownName =
      state === 'up' ? cardName + (card?.reversed ? ` · ${labels.reversed}` : '') : '';

    return (
      <div
        key={i}
        className={[styles.slot, rotated && styles.rotated].filter(Boolean).join(' ')}
        style={place}
        data-slot={n}
      >
        <span className={styles.num} aria-hidden="true">
          {n}
        </span>
        <div
          ref={(element) => cardRef?.(i, element)}
          className={[styles.box, turnable && styles.turnable, current === i && styles.current]
            .filter(Boolean)
            .join(' ')}
          data-state={state}
        >
          {card ? (
            <div className={styles.face} aria-hidden={turnable || undefined}>
              <TarotCard
                src={card.src}
                name={card.name}
                reversed={card.reversed}
                faceDown={state === 'down'}
                waiting={waiting && turnable}
                label={fill(labels.faceDown, { n, name: position.name })}
                labels={cardLabels}
                sizes="(min-width: 768px) 148px, 96px"
                style={{ '--w': 'var(--cw)' } as CSSVars}
              />
            </div>
          ) : (
            <div className={styles.empty} aria-hidden="true" />
          )}
          {turnable ? (
            <button
              type="button"
              className={styles.turn}
              aria-label={fill(labels.turnOver, { n, name: position.name })}
              onClick={() => onCardClick?.(i)}
            />
          ) : null}
        </div>
        {!compact ? (
          <div className={styles.label}>
            <span className={styles.overline}>{`${n} · ${position.prompt}`}</span>
            <span className={styles.position}>{position.name}</span>
            <span
              className={[styles.cardName, state === 'up' && styles.shown]
                .filter(Boolean)
                .join(' ')}
            >
              {shownName || ' '}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={[
        styles.spread,
        compact ? styles.compact : styles.roomy,
        positions.length === 1 && styles.single,
        tone === 'night' && styles.night,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
    >
      <div
        className={[styles.layout, halfRows && styles.fine].filter(Boolean).join(' ')}
        style={layoutStyle}
      >
        {positions.map((_, i) => slot(i))}
      </div>
      {compact && legend ? (
        <ol className={styles.legend} aria-label={labels.legend}>
          {positions.map((position, i) => {
            const card = cards[i];
            const shown = card && card.revealed !== false ? card : null;
            return (
              <li
                key={i}
                className={[current === i && styles.currentRow, shown && styles.shownRow]
                  .filter(Boolean)
                  .join(' ')}
              >
                <b>{i + 1}</b>
                <span>
                  {position.name}
                  <small>
                    {shown
                      ? shown.name + (shown.reversed ? ` · ${labels.reversed}` : '')
                      : position.prompt}
                  </small>
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
