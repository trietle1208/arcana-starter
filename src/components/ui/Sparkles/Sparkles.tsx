'use client';

import { useMemo } from 'react';
import { prefersReducedMotion } from '../_shared/motion';
import { seeded, star4, n, type CSSVars } from '../_shared/shapes';
import styles from './Sparkles.module.css';

export interface SparklesProps {
  count?: number;
  /** Change the key of the element (or the seed) to replay the burst. */
  seed?: number;
}

/**
 * A single one-shot burst of gold sparkles (1.1s). Decorative only: never loop it, never use it
 * for errors or ordinary saves. Renders nothing under reduced motion.
 */
export function Sparkles({ count = 12, seed = 3 }: SparklesProps) {
  const bits = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.4;
      const distance = 40 + rand() * 70;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20,
        size: 4 + rand() * 7,
        delay: rand() * 0.25,
      };
    });
  }, [count, seed]);

  if (prefersReducedMotion()) return null;
  return (
    <span className={styles.sparkles} aria-hidden="true">
      {bits.map((bit, i) => {
        const style: CSSVars = {
          '--x': `${n(bit.x)}px`,
          '--y': `${n(bit.y)}px`,
          width: bit.size,
          height: bit.size,
          animationDelay: `${n(bit.delay)}s`,
        };
        return (
          <svg key={i} viewBox="0 0 20 20" style={style}>
            <path d={star4(10, 10, 9)} fill="currentColor" />
          </svg>
        );
      })}
    </span>
  );
}
