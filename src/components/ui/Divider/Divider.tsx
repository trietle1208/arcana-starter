import { star4 } from '../_shared/shapes';
import styles from './Divider.module.css';

export interface DividerProps {
  /** `rule` is a hand-drawn pencil line; `sprig` (olive) and `star` (gold-ink) are ornaments. */
  variant?: 'rule' | 'sprig' | 'star';
}

/**
 * A separator with a hand-drawn quality. Use at most one ornament (sprig or star) per screen:
 * stars belong to ritual moments, everyday panels stay plain.
 */
export function Divider({ variant = 'rule' }: DividerProps) {
  if (variant === 'star') {
    return (
      <div className={`${styles.divider} ${styles.sprig} ${styles.star}`} role="separator">
        <svg viewBox="0 0 44 18" fill="currentColor" aria-hidden="true">
          <path d={star4(22, 9, 8)} />
          <path d={star4(9, 9, 3)} />
          <path d={star4(35, 9, 3)} />
        </svg>
      </div>
    );
  }
  if (variant === 'sprig') {
    return (
      <div className={`${styles.divider} ${styles.sprig}`} role="separator">
        <svg
          viewBox="0 0 44 18"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 12c8-1 22-1 36-4" />
          <path d="M12 11.5c-1-3 1-6 4-7-.5 3-1.8 5.5-4 7zM20 11c1-3.5 4-5.5 7-5.5-1 3-3.5 5-7 5.5zM27 10c-2-2.5-2-5.5 0-7.5 1.5 2.5 1.5 5 0 7.5zM16 11.8c1.5 2 4 3 6.5 2.5-1.6-1.8-4-2.6-6.5-2.5z" />
        </svg>
      </div>
    );
  }
  return (
    <div className={styles.divider} role="separator">
      <svg
        viewBox="0 0 400 8"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M1 4.5c40-1.2 80 .8 130-.4s90-1 140 .3 90-.6 128-.2" />
      </svg>
    </div>
  );
}
