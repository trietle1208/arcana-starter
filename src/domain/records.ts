import type { CardId, Locale, Orientation } from './tarot/types';

// The user records of docs/TECH_DESIGN.md §5.2. They point at cards and spreads by permanent id;
// card content is never copied into them.
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

export interface JournalEntry {
  id: string;
  readingId: string | null; // null = free reflection without a draw
  cardId: CardId | null; // the card a free reflection is about (Card Detail, card of the day)
  title: string;
  body: string;
  prompt: string | null; // the reflection question shown when writing
  tags: string[]; // moods/topics: ['Work', 'Calm']
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryWithReading extends JournalEntry {
  reading: Reading | null;
}

export interface StudyProgress {
  cardId: CardId;
  box: 1 | 2 | 3 | 4 | 5; // Leitner box
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}

export type ReduceMotion = 'system' | 'on' | 'off';
/** How much the Reading Room says about each card: `full` adds its symbolism and a question. */
export type InterpretationDetail = 'brief' | 'full';

export interface UserSettings {
  locale: Locale; // default 'en'
  theme: 'paper'; // only theme for now; kept for future
  includeReversed: boolean; // default true
  revealOneByOne: boolean; // default true
  defaultSpreadId: string; // default 'three-card'
  displayName: string | null; // optional; the Home greeting omits the name when null
  reduceMotion: ReduceMotion; // default 'system'
  interpretationDetail: InterpretationDetail; // default 'brief'
}
