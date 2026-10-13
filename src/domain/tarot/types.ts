export type Locale = 'en' | 'vi';
export type Localized<T = string> = Record<Locale, T>;

export type Orientation = 'upright' | 'reversed';
export type Suit = 'cups' | 'wands' | 'swords' | 'pentacles';
export type CourtRank = 'page' | 'knight' | 'queen' | 'king';
export type CardId = string; // 'the-hermit', 'cups-03', 'wands-ace', 'swords-queen'

export interface Interpretation {
  summary: Localized; // 2–4 sentences
  keywords: Localized<string[]>; // 3–5 words
}

interface CardBase {
  id: CardId;
  name: Localized; // { en: 'The Hermit', vi: 'Ẩn Sĩ' }
  image: string; // '/cards/09-the-hermit.webp'
  intro: Localized; // 1–3 sentence introduction: Card Detail header and the Home card of the day
  keywords: Localized<string[]>; // general keywords for tiles and search
  meanings: Record<Orientation, Interpretation>;
  symbolism: Localized;
  reflectionQuestions: Localized<string[]>;
}

export interface MajorCard extends CardBase {
  arcana: 'major';
  number: number; // 0–21
}

export interface MinorCard extends CardBase {
  arcana: 'minor';
  suit: Suit;
  rank: number | CourtRank; // 1 (ace) … 10, or a court rank
}

export type TarotCard = MajorCard | MinorCard;

export interface SpreadPosition {
  key: string; // 'past' — stable, stored with each drawn card
  name: Localized; // { en: 'Past', vi: 'Quá khứ' }
  prompt: Localized; // 'What shaped this'
  layout: { col: number; row: number; rotate?: 0 | 90 }; // grid hint for the renderer
}

export interface TarotSpread {
  id: string; // 'one-card' | 'three-card' | 'celtic-cross'
  version: number; // bump if positions change meaning
  name: Localized;
  description: Localized;
  grid: { cols: number; rows: number };
  positions: readonly SpreadPosition[]; // array order = draw order
}
