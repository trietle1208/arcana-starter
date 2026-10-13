'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { CardBack } from '../CardBack/CardBack';
import { Sparkles } from '../Sparkles/Sparkles';
import { prefersReducedMotion } from '../_shared/motion';
import styles from './TarotCard.module.css';

export interface TarotCardLabels {
  /** Accessible name of a face-down card that can be turned over. */
  faceDown: string;
  /** Printed under the name of a reversed card. */
  reversed: string;
  /** Alt text of a reversed card; {name} is replaced. */
  altReversed: string;
}

const DEFAULT_LABELS: TarotCardLabels = {
  faceDown: 'Face-down card — select to reveal',
  reversed: 'Reversed',
  altReversed: '{name} (reversed)',
};

export interface TarotCardProps {
  /** Image URL of the card art, e.g. '/cards/09-the-hermit.webp'. Without it a placeholder shows. */
  src?: string;
  name?: string;
  numeral?: string;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  reversed?: boolean;
  selected?: boolean;
  /** Print the name (and "Reversed") under the card. */
  showName?: boolean;
  onClick?: () => void;
  /** Overrides the accessible name of a face-down card. */
  label?: string;
  labels?: Partial<TarotCardLabels>;
  /** `sizes` for next/image; defaults to the width of the chosen size. */
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
  className?: string;
}

const SIZE_PX = { sm: 96, md: 148, lg: 236 } as const;

/**
 * One Tarot card: the original artwork inside a warm off-white frame. The art is never filtered,
 * tinted or overlaid. When `faceDown` turns false the card turns over, a band of candle light
 * sweeps across it and gold sparkles scatter (skipped under reduced motion).
 */
export function TarotCard({
  src,
  name,
  numeral,
  size = 'md',
  faceDown = false,
  reversed = false,
  selected,
  showName,
  onClick,
  label,
  labels: labelOverrides,
  sizes,
  priority,
  style,
  className,
}: TarotCardProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };

  // "Revealing" starts when faceDown goes from true to false and ends 1.4s later.
  const [wasDown, setWasDown] = useState(faceDown);
  const [revealing, setRevealing] = useState(false);
  if (wasDown !== faceDown) {
    setWasDown(faceDown);
    if (wasDown && !faceDown && !prefersReducedMotion()) setRevealing(true);
  }
  useEffect(() => {
    if (!revealing) return;
    const timer = setTimeout(() => setRevealing(false), 1400);
    return () => clearTimeout(timer);
  }, [revealing]);

  const cardName = name ?? '';
  const alt = faceDown ? '' : reversed ? labels.altReversed.replace('{name}', cardName) : cardName;

  const face = src ? (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? `${SIZE_PX[size]}px`}
      priority={priority}
      draggable={false}
    />
  ) : (
    <div className={styles.placeholder} aria-hidden="true">
      <b>{numeral ?? ''}</b>
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={1.2}>
        <circle cx={20} cy={20} r={12} />
        <path d="M4 26c10-2 22-2 32 0" />
      </svg>
      <span>{cardName}</span>
    </div>
  );

  const inner = (
    <div className={styles.inner}>
      <div className={styles.face}>
        <div className={styles.art}>{face}</div>
        {revealing ? <span className={styles.shine} aria-hidden="true" /> : null}
      </div>
      <div className={styles.back} aria-hidden="true">
        <CardBack />
      </div>
    </div>
  );

  const caption =
    showName && !faceDown ? (
      <div className={styles.caption}>
        <span className={styles.name}>{cardName}</span>
        {reversed ? <span className={styles.rev}>{labels.reversed}</span> : null}
      </div>
    ) : null;

  const classes = [
    styles.tc,
    styles[size],
    onClick && styles.interactive,
    faceDown && styles.down,
    revealing && styles.revealing,
    reversed && styles.reversed,
    selected && styles.selected,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const accessibleName = faceDown ? (label ?? labels.faceDown) : undefined;

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={accessibleName}
        aria-pressed={selected !== undefined ? selected : undefined}
        style={style}
      >
        {inner}
        {revealing ? <Sparkles count={14} /> : null}
        {caption}
      </button>
    );
  }
  return (
    <div
      className={classes}
      role={faceDown ? 'img' : undefined}
      aria-label={accessibleName}
      style={style}
    >
      {inner}
      {revealing ? <Sparkles count={14} /> : null}
      {caption}
    </div>
  );
}
