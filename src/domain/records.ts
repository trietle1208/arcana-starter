import type { CardId, Orientation } from './tarot/types';

// DrawnCard and Reading so far. The other user records of docs/TECH_DESIGN.md §5.2 arrive with
// the database in Phase 3.
export interface DrawnCard {
  positionIndex: number; // 0-based, matches spread.positions order
  positionKey: string; // 'past'
  cardId: CardId;
  orientation: Orientation;
}

export interface Reading {
  id: string; // uuid
  spreadId: string;
  spreadVersion: number;
  question: string | null;
  cards: DrawnCard[]; // sorted by positionIndex
  drawnAt: Date;
}
