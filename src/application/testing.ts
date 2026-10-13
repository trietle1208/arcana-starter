// Fixtures for the use-case tests: real readings from the real engine, with a seeded RNG.
import { getSpread } from '@/content/spreads';
import { seededRng } from '@/domain/random';
import type { Reading } from '@/domain/records';
import { drawReading } from './readings/drawReading';

let counter = 0;
let entryCounter = 0;

/** A valid, deterministic reading of a spread. */
export function sampleReading(spreadId = 'three-card', seed = 7, id?: string): Reading {
  counter += 1;
  return drawReading(
    getSpread(spreadId).id,
    { includeReversed: true },
    {
      rng: seededRng(seed),
      now: () => new Date('2026-10-12T20:15:00.000Z'),
      newId: () => id ?? `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`,
    },
  );
}

/** Deps with a clock the test controls and ids that count up (never repeating within a run). */
export function fixedDeps(start = '2026-10-12T20:30:00.000Z') {
  let time = new Date(start).getTime();
  return {
    now: () => new Date(time),
    advance: (ms: number) => {
      time += ms;
    },
    newId: () => `11111111-1111-4111-8111-${String((entryCounter += 1)).padStart(12, '0')}`,
  };
}
