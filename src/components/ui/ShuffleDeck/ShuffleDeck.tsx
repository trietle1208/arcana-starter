import { CardBack } from '../CardBack/CardBack';
import type { CSSVars } from '../_shared/shapes';
import styles from './ShuffleDeck.module.css';

export interface ShuffleDeckLabels {
  resting: string;
  shuffling: string;
}

const DEFAULT_LABELS: ShuffleDeckLabels = {
  resting: 'A shuffled deck, face down',
  shuffling: 'The deck is being shuffled',
};

export interface ShuffleDeckProps {
  /** While true the deck riffles: three times in 2.7s. Stop it then; it is a moment, not a loader. */
  shuffling?: boolean;
  count?: number;
  /** Width of the deck in px. */
  width?: number;
  className?: string;
  labels?: Partial<ShuffleDeckLabels>;
}

const DUST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** A face-down deck. Odd cards swing right, even cards left, then fall back interleaved. */
export function ShuffleDeck({
  shuffling = false,
  count = 14,
  width = 96,
  className,
  labels: labelOverrides,
}: ShuffleDeckProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const classes = [styles.deck, shuffling && styles.shuffling, className].filter(Boolean).join(' ');
  const deckStyle: CSSVars = { '--dw': `${width}px` };
  return (
    <div
      className={classes}
      style={deckStyle}
      role="img"
      aria-label={shuffling ? labels.shuffling : labels.resting}
    >
      {Array.from({ length: count }, (_, i) => {
        const style: CSSVars = {
          '--i': i,
          '--side': i % 2 ? 1 : -1,
          '--d': `${((i % 2) * 0.07 + Math.floor(i / 2) * 0.045).toFixed(3)}s`,
          zIndex: i,
        };
        return (
          <div key={i} className={styles.card} style={style}>
            <CardBack />
          </div>
        );
      })}
      {shuffling ? (
        <span className={styles.dust} aria-hidden="true">
          {DUST.map((k) => {
            const style: CSSVars = { '--k': k };
            return <i key={k} style={style} />;
          })}
        </span>
      ) : null}
    </div>
  );
}
