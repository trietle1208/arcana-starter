import type { DrawnCard } from '../records';
import type { Interpretation, Orientation, SpreadPosition, TarotCard, TarotSpread } from './types';

/** The upright or the reversed reading of one card; everything else on the card is shared. */
export function interpretationFor(card: TarotCard, orientation: Orientation): Interpretation {
  return card.meanings[orientation];
}

export interface InterpretedCard {
  position: SpreadPosition;
  card: TarotCard;
  orientation: Orientation;
  meaning: Interpretation;
}

/** Pairs a drawn card with its spread position and the meaning for its orientation. */
export function interpret(drawn: DrawnCard, card: TarotCard, spread: TarotSpread): InterpretedCard {
  if (drawn.cardId !== card.id) {
    throw new Error(`Drawn card "${drawn.cardId}" does not match card "${card.id}"`);
  }
  const position = spread.positions[drawn.positionIndex];
  if (!position) {
    throw new RangeError(
      `Position ${drawn.positionIndex} is outside spread "${spread.id}" (${spread.positions.length} positions)`,
    );
  }
  if (position.key !== drawn.positionKey) {
    throw new Error(
      `Position ${drawn.positionIndex} of "${spread.id}" is "${position.key}", not "${drawn.positionKey}"`,
    );
  }
  return {
    position,
    card,
    orientation: drawn.orientation,
    meaning: interpretationFor(card, drawn.orientation),
  };
}
