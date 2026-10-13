import { z } from 'zod';
import { MAX_TAG_LENGTH, MAX_TAGS, normalizeTags } from '@/domain/journal';
import type { DrawnCard, JournalEntry, Reading } from '@/domain/records';

// Zod schemas shared by saving, editing, restoring after a delete and the JSON import. They check
// shape only; checking ids against the content is `checkReading` in readings/checkReading.ts.

export const TitleSchema = z.string().trim().min(1).max(140);
export const BodySchema = z.string().max(20_000);
export const PromptSchema = z.string().trim().min(1).max(280);
export const TagsSchema = z
  .array(z.string().trim().min(1).max(MAX_TAG_LENGTH))
  .transform(normalizeTags)
  .refine((tags) => tags.length <= MAX_TAGS);

export const DrawnCardSchema = z
  .object({
    positionIndex: z.number().int().min(0).max(31),
    positionKey: z.string().min(1).max(64),
    cardId: z.string().min(1).max(64),
    orientation: z.enum(['upright', 'reversed']),
  })
  .strict();

export const ReadingSchema = z
  .object({
    id: z.uuid(),
    spreadId: z.string().min(1).max(64),
    spreadVersion: z.number().int().min(1),
    question: z.string().max(500).nullable(),
    cards: z.array(DrawnCardSchema).min(1).max(32),
    drawnAt: z.coerce.date(),
  })
  .strict();

export const JournalEntrySchema = z
  .object({
    id: z.uuid(),
    readingId: z.uuid().nullable(),
    cardId: z.string().min(1).max(64).nullable(),
    title: TitleSchema,
    body: BodySchema,
    prompt: PromptSchema.nullable(),
    tags: TagsSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .strict();

// The schemas and the domain types must not drift: each side has to be assignable to the other.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _card: Equal<z.infer<typeof DrawnCardSchema>, DrawnCard> = true;
const _reading: Equal<z.infer<typeof ReadingSchema>, Reading> = true;
const _entry: Equal<z.infer<typeof JournalEntrySchema>, JournalEntry> = true;
void [_card, _reading, _entry];
