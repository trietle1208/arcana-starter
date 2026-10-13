import type { CardId, Orientation } from './tarot/types';

// Only DrawnCard for now (Phase 1 needs it for interpret). The other user records of
// docs/TECH_DESIGN.md §5.2 arrive with the database in Phase 3.
export interface DrawnCard {
  positionIndex: number; // 0-based, matches spread.positions order
  positionKey: string; // 'past'
  cardId: CardId;
  orientation: Orientation;
}
