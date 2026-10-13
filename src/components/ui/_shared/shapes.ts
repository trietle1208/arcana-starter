import type { CSSProperties } from 'react';

/** A style object that may also set CSS custom properties: { '--x': '12px' }. */
export type CSSVars = CSSProperties & { [name: `--${string}`]: string | number | undefined };

/** Rounds to 3 decimals so server and browser always print the same SVG numbers. */
export const n = (value: number): string => String(Math.round(value * 1000) / 1000);

/** Path of a four-point sparkle centred on (x, y) with radius r. */
export function star4(x: number, y: number, r: number): string {
  const q = r * 0.18;
  return (
    `M${n(x)} ${n(y - r)}Q${n(x + q)} ${n(y - q)} ${n(x + r)} ${n(y)}` +
    `Q${n(x + q)} ${n(y + q)} ${n(x)} ${n(y + r)}` +
    `Q${n(x - q)} ${n(y + q)} ${n(x - r)} ${n(y)}` +
    `Q${n(x - q)} ${n(y - q)} ${n(x)} ${n(y - r)}Z`
  );
}

/**
 * Small deterministic random sequence (mulberry32) so the sparkle burst looks the same on the
 * server and in the browser. Phase 2 adds the injectable Rng to the domain; this one only
 * decorates and never decides anything.
 */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
