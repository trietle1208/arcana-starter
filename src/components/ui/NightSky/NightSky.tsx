import type { CSSProperties, ReactNode } from 'react';
import { n, seeded, star4, type CSSVars } from '../_shared/shapes';
import styles from './NightSky.module.css';

export interface NightSkyProps {
  children?: ReactNode;
  /** How many stars; about one in five is a gold four-point sparkle. */
  stars?: number;
  /** The same seed always scatters the same stars, on the server and in the browser. */
  seed?: number;
  as?: 'section' | 'div' | 'header';
  className?: string;
  /** Accessible name when rendered as a section (a landmark). */
  label?: string;
  style?: CSSProperties;
}

interface Star {
  x: number;
  y: number;
  spark: boolean;
  size: number;
  delay: number;
  duration: number;
}

const cache = new Map<string, Star[]>();

function scatter(count: number, seed: number): Star[] {
  const key = `${seed}:${count}`;
  const known = cache.get(key);
  if (known) return known;
  const rand = seeded(seed);
  const out = Array.from({ length: count }, (): Star => {
    const x = rand() * 100;
    const y = rand() * 100;
    const spark = rand() < 0.22;
    const size = 0.6 + rand() * 1.1;
    const delay = rand() * 6;
    const duration = 3 + rand() * 4;
    return { x, y, spark, size, delay, duration };
  });
  cache.set(key, out);
  return out;
}

/**
 * The storybook night: a midnight surface lit by a faint candle glow, scattered with twinkling
 * stars. Always a framed panel inside the paper page, never a page background. Focus rings turn
 * gold inside it (see globals.css).
 */
export function NightSky({
  children,
  stars = 36,
  seed = 7,
  as: Tag = 'section',
  className,
  label,
  style,
}: NightSkyProps) {
  return (
    <Tag
      className={[styles.night, className].filter(Boolean).join(' ')}
      style={style}
      aria-label={label}
      data-surface="night"
    >
      <div className={styles.sky} aria-hidden="true">
        {scatter(stars, seed).map((star, i) => {
          const place: CSSVars = {
            left: `${n(star.x)}%`,
            top: `${n(star.y)}%`,
            '--z': n(star.size),
            animationDelay: `${star.delay.toFixed(2)}s`,
            animationDuration: `${star.duration.toFixed(2)}s`,
          };
          return star.spark ? (
            <svg
              key={i}
              className={`${styles.star} ${styles.spark}`}
              viewBox="0 0 20 20"
              style={place}
            >
              <path d={star4(10, 10, 9)} fill="currentColor" />
            </svg>
          ) : (
            <span key={i} className={styles.star} style={place} />
          );
        })}
      </div>
      <div className={styles.body}>{children}</div>
    </Tag>
  );
}
