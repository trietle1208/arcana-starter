'use client';

import type { KeyboardEvent } from 'react';
import { CardBack } from '../CardBack/CardBack';
import { fill } from '../_shared/format';
import type { CSSVars } from '../_shared/shapes';
import styles from './CardFan.module.css';

export interface CardFanLabels {
  /** Accessible name of the fan as a group. */
  group: string;
  /** Accessible name of one card; {n} and {total} are replaced. */
  card: string;
}

const DEFAULT_LABELS: CardFanLabels = {
  group: 'Choose from the fanned deck',
  card: 'Choose card {n} of {total}',
};

export interface CardFanProps {
  /** Called with the fan index of the card chosen and its element (to fly it from there). */
  onPick?: (index: number, element: HTMLButtonElement) => void;
  count?: number;
  /** Fan indexes already chosen: they leave a gap. */
  taken?: readonly number[];
  /** Width of the arc in degrees. */
  spread?: number;
  /** Width of one card in px; left out, the stylesheet decides (64px, or what a parent sets). */
  cardWidth?: number;
  disabled?: boolean;
  labels?: Partial<CardFanLabels>;
  className?: string;
}

/**
 * Face-down cards spread over an arc, like a hand of cards. Hover or focus lifts a card 20px
 * along its own angle. Every card is a button; the arrow keys, Home and End move between the
 * cards that are left.
 */
export function CardFan({
  onPick,
  count = 21,
  taken = [],
  spread = 80,
  cardWidth,
  disabled = false,
  labels: labelOverrides,
  className,
}: CardFanProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const open = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button'),
    ).filter((button) => !button.disabled);
    if (open.length === 0) return;
    const at = open.indexOf(document.activeElement as HTMLButtonElement);
    const last = open.length - 1;
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
            ? Math.max(at - 1, 0)
            : Math.min(at + 1, last);
    event.preventDefault();
    open[next]?.focus();
  }

  const fanStyle: CSSVars | undefined =
    cardWidth === undefined ? undefined : { '--fw': `${cardWidth}px` };
  return (
    <div
      className={[styles.fan, className].filter(Boolean).join(' ')}
      style={fanStyle}
      role="group"
      aria-label={labels.group}
      onKeyDown={onKeyDown}
    >
      {Array.from({ length: count }, (_, i) => {
        const angle = count === 1 ? 0 : -spread / 2 + (spread * i) / (count - 1);
        const isTaken = taken.includes(i);
        const style: CSSVars = { '--a': `${angle}deg`, '--i': i };
        return (
          <button
            key={i}
            type="button"
            className={[styles.card, isTaken && styles.taken].filter(Boolean).join(' ')}
            style={style}
            disabled={isTaken || disabled}
            data-fan-index={i}
            aria-label={fill(labels.card, { n: i + 1, total: count })}
            onClick={(event) => onPick?.(i, event.currentTarget)}
          >
            <CardBack />
          </button>
        );
      })}
    </div>
  );
}
