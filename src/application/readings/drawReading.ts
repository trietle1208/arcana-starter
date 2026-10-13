// The use case the Reading Room calls in the browser. It imports the spread data and the domain
// deck ids on purpose, not the content registry: the registry parses all 78 cards at load, and
// drawing needs none of their text.
import { getSpread } from '@/content/spreads';
import { cryptoRng, type Rng } from '@/domain/random';
import { drawSpread } from '@/domain/reading/draw';
import type { Reading } from '@/domain/records';
import { DECK_IDS } from '@/domain/tarot/deck';

/** The part of the user's settings a draw depends on (Phase 3 passes the saved settings). */
export interface DrawSettings {
  includeReversed: boolean;
}

export const DEFAULT_DRAW_SETTINGS: DrawSettings = { includeReversed: true };

export interface DrawDeps {
  rng: Rng;
  now: () => Date;
  newId: () => string;
}

/** Draws a whole spread at once; throws on an unknown spread id. */
export function drawReading(
  spreadId: string,
  settings: DrawSettings = DEFAULT_DRAW_SETTINGS,
  deps: Partial<DrawDeps> = {},
): Reading {
  const rng = deps.rng ?? cryptoRng();
  const now = deps.now ?? (() => new Date());
  const newId = deps.newId ?? (() => crypto.randomUUID());
  const spread = getSpread(spreadId);
  return {
    id: newId(),
    spreadId: spread.id,
    spreadVersion: spread.version,
    question: null,
    cards: drawSpread(spread, DECK_IDS, { rng, includeReversed: settings.includeReversed }),
    drawnAt: now(),
  };
}
