import type * as React from 'react';

export type IconName = 'home' | 'library' | 'reading' | 'study' | 'journal' | 'settings' | 'search' | 'plus' | 'check' | 'arrow' | 'shuffle' | 'bookmark' | 'pen' | 'turn' | 'info' | 'x';
export interface IconProps { name: IconName; size?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'quiet' | 'gold' | 'night'; size?: 'md' | 'sm'; icon?: IconName; iconAfter?: IconName }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> { label: string; hint?: string; multiline?: boolean; rows?: number }
export declare function TextField(props: TextFieldProps): React.ReactElement;

export interface TagProps { children?: React.ReactNode; tone?: 'neutral' | 'terracotta' | 'olive' | 'rose'; selected?: boolean; onClick?: () => void; className?: string }
export declare function Tag(props: TagProps): React.ReactElement;

export interface SegmentedControlProps { options: { value: string; label: string }[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; label: string }
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;

export interface SwitchProps { label: string; description?: string; checked?: boolean; defaultChecked?: boolean; onChange?: (checked: boolean) => void }
export declare function Switch(props: SwitchProps): React.ReactElement;

export interface DividerProps { variant?: 'rule' | 'sprig' | 'star' }
export declare function Divider(props: DividerProps): React.ReactElement;

export interface NavItem { id: string; label: string; icon?: IconName; href?: string; shortLabel?: string }
export interface AppNavProps { active?: string; items?: NavItem[]; orientation?: 'side' | 'bottom'; onNavigate?: (id: string) => void; className?: string }
export declare function AppNav(props: AppNavProps): React.ReactElement;

export interface TarotCardProps { src?: string; name?: string; numeral?: string; size?: 'sm' | 'md' | 'lg'; faceDown?: boolean; reversed?: boolean; selected?: boolean; showName?: boolean; onClick?: () => void; label?: string; style?: React.CSSProperties; className?: string }
export declare function TarotCard(props: TarotCardProps): React.ReactElement;

export interface CardTileProps { src?: string; name: string; meta?: string; numeral?: string; keywords?: string[]; href?: string }
export declare function CardTile(props: CardTileProps): React.ReactElement;

export interface SpreadCard { src?: string; name?: string; reversed?: boolean; revealed?: boolean }
export interface SpreadProps { type?: 'three' | 'celtic'; cards?: SpreadCard[]; positions?: [name: string, question: string][]; current?: number; onCardClick?: (index: number) => void; legend?: boolean }
export declare function Spread(props: SpreadProps): React.ReactElement;

export interface FeaturedCardProps { src?: string; name: string; eyebrow?: string; keywords?: string[]; summary?: string; prompt?: string; actions?: React.ReactNode; reversed?: boolean }
export declare function FeaturedCard(props: FeaturedCardProps): React.ReactElement;

export interface ProgressMeterProps { label: string; value: number; max?: number; caption?: string }
export declare function ProgressMeter(props: ProgressMeterProps): React.ReactElement;

export interface MeaningPanelProps { upright: string; reversed?: string; symbolism?: string; keywords?: string[] }
export declare function MeaningPanel(props: MeaningPanelProps): React.ReactElement;

export interface JournalEntryProps { day: string; month: string; spread: string; title: string; excerpt?: string; tags?: string[]; cards?: string[]; href?: string }
export declare function JournalEntry(props: JournalEntryProps): React.ReactElement;

export interface NoticeProps { title?: string; children?: React.ReactNode; tone?: 'success' | 'info'; action?: React.ReactNode }
export declare function Notice(props: NoticeProps): React.ReactElement;

export interface FlashcardProps { front: React.ReactNode; back: React.ReactNode; eyebrow?: string; flipped?: boolean; defaultFlipped?: boolean; onFlip?: (flipped: boolean) => void }
export declare function Flashcard(props: FlashcardProps): React.ReactElement;

declare global { interface Window { Arcana: { Icon: typeof Icon; Button: typeof Button; TextField: typeof TextField; Tag: typeof Tag; SegmentedControl: typeof SegmentedControl; Switch: typeof Switch; Divider: typeof Divider; AppNav: typeof AppNav; TarotCard: typeof TarotCard; CardTile: typeof CardTile; Spread: typeof Spread; FeaturedCard: typeof FeaturedCard; ProgressMeter: typeof ProgressMeter; MeaningPanel: typeof MeaningPanel; JournalEntry: typeof JournalEntry; Notice: typeof Notice; Flashcard: typeof Flashcard; CardBack: typeof CardBack; NightSky: typeof NightSky; Sparkles: typeof Sparkles; ShuffleDeck: typeof ShuffleDeck; CardFan: typeof CardFan; ReadingRitual: typeof ReadingRitual } } }

// Storybook magic
export interface CardBackProps { className?: string }
export declare function CardBack(props: CardBackProps): React.ReactElement;
export interface NightSkyProps { children?: React.ReactNode; stars?: number; seed?: number; as?: keyof JSX.IntrinsicElements; className?: string; label?: string; style?: React.CSSProperties }
export declare function NightSky(props: NightSkyProps): React.ReactElement;
export interface SparklesProps { count?: number; seed?: number }
export declare function Sparkles(props: SparklesProps): React.ReactElement | null;
export interface ShuffleDeckProps { shuffling?: boolean; count?: number; width?: number; className?: string }
export declare function ShuffleDeck(props: ShuffleDeckProps): React.ReactElement;
export interface CardFanProps { onPick?: (index: number, element: HTMLButtonElement) => void; count?: number; taken?: number[]; spread?: number; cardWidth?: number; disabled?: boolean; label?: string; className?: string }
export declare function CardFan(props: CardFanProps): React.ReactElement;
export type RitualStep = 'idle' | 'shuffling' | 'cut' | 'fan' | 'reveal' | 'done';
export interface ReadingRitualProps { cards: { src?: string; name: string; reversed?: boolean }[]; question?: string; layout?: 'row' | 'celtic'; positions?: [name: string, question: string][]; fanCount?: number; onSave?: () => void; onComplete?: () => void; initialStep?: RitualStep; seed?: number; className?: string }
export declare function ReadingRitual(props: ReadingRitualProps): React.ReactElement;
