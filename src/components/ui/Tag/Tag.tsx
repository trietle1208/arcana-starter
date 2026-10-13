import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Tag.module.css';

export interface TagProps {
  children?: ReactNode;
  tone?: 'neutral' | 'terracotta' | 'olive' | 'rose';
  /** With `onClick` (or `selected`) the tag becomes a pressable filter chip. */
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** A small label (keywords, moods, study state), or a filter chip when given onClick/selected. */
export function Tag({ children, tone = 'neutral', selected, onClick, className }: TagProps) {
  if (onClick !== undefined || selected !== undefined) {
    return (
      <button
        type="button"
        className={[styles.tag, styles.chip, className].filter(Boolean).join(' ')}
        aria-pressed={!!selected}
        onClick={onClick}
      >
        {selected ? <Icon name="check" size={16} /> : null}
        {children}
      </button>
    );
  }
  return (
    <span
      className={[styles.tag, tone !== 'neutral' && styles[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
