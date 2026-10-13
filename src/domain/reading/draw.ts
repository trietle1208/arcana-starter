import type { DrawnCard } from '../records';
import { randomInt, type Rng } from '../random';
import type { CardId, Orientation, TarotSpread } from '../tarot/types';

/** Uniform random k-subset in random order (partial Fisher–Yates). */
export function sampleWithoutReplacement<T>(items: readonly T[], k: number, rng: Rng): T[] {
  if (!Number.isInteger(k) || k < 0 || k > items.length) {
    throw new RangeError(`Cannot draw ${k} from ${items.length}`);
  }
  const pool = items.slice();
  for (let i = 0; i < k; i++) {
    const j = i + randomInt(rng, pool.length - i); // j in [i, n)
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, k);
}

export interface DrawOptions {
  rng: Rng;
  includeReversed: boolean;
  reversedChance?: number; // default 0.5
}

export function drawSpread(
  spread: TarotSpread,
  deck: readonly CardId[],
  { rng, includeReversed, reversedChance = 0.5 }: DrawOptions,
): DrawnCard[] {
  const chance = includeReversed ? reversedChance : 0;
  const cards = sampleWithoutReplacement(deck, spread.positions.length, rng);
  return spread.positions.map((position, i) => ({
    positionIndex: i,
    positionKey: position.key,
    cardId: cards[i],
    orientation: (rng() < chance ? 'reversed' : 'upright') satisfies Orientation,
  }));
}
