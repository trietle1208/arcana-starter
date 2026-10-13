import { z } from 'zod';
import type { MajorCard, MinorCard, TarotCard } from '@/domain/tarot/types';

// Structural checks only. Cards still being written carry the string "TODO" in their text fields,
// which is a valid string here; content.test.ts decides where "TODO" may appear and reports it.

const text = z.string().trim().min(1);
const localized = <T extends z.ZodType>(value: T) => z.object({ en: value, vi: value }).strict();

const LocalizedText = localized(text);
const Keywords = localized(z.array(text).min(1).max(5));
const Questions = localized(z.array(text).min(1).max(4));

const InterpretationSchema = z
  .object({
    summary: LocalizedText,
    keywords: Keywords,
  })
  .strict();

const cardBase = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: LocalizedText,
  image: z.string().regex(/^\/cards\/[a-z0-9-]+\.webp$/),
  intro: LocalizedText,
  keywords: Keywords,
  meanings: z.object({ upright: InterpretationSchema, reversed: InterpretationSchema }).strict(),
  symbolism: LocalizedText,
  reflectionQuestions: Questions,
};

export const MajorCardSchema = z
  .object({
    ...cardBase,
    arcana: z.literal('major'),
    number: z.number().int().min(0).max(21),
  })
  .strict();

export const MinorCardSchema = z
  .object({
    ...cardBase,
    arcana: z.literal('minor'),
    suit: z.enum(['cups', 'wands', 'swords', 'pentacles']),
    rank: z.union([z.number().int().min(1).max(10), z.enum(['page', 'knight', 'queen', 'king'])]),
  })
  .strict();

export const TarotCardSchema = z.discriminatedUnion('arcana', [MajorCardSchema, MinorCardSchema]);
export const CardFileSchema = z.array(TarotCardSchema);

// The schema and the domain types must not drift: each side has to be assignable to the other.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _major: Equal<z.infer<typeof MajorCardSchema>, MajorCard> = true;
const _minor: Equal<z.infer<typeof MinorCardSchema>, MinorCard> = true;
const _card: Equal<z.infer<typeof TarotCardSchema>, TarotCard> = true;
void [_major, _minor, _card];
