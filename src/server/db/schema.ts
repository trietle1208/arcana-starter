// The five tables of docs/TECH_DESIGN.md §5.3. Cards and spreads are not tables: their ids are
// validated against the static content, never joined.
//
// No `import 'server-only'` here: drizzle-kit loads this file outside Next.js. It holds table
// definitions only, so there is nothing to protect.
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';

export const readings = sqliteTable('readings', {
  id: text('id').primaryKey(), // uuid
  spreadId: text('spread_id').notNull(),
  spreadVersion: integer('spread_version').notNull(),
  question: text('question'),
  drawnAt: integer('drawn_at').notNull(), // unix ms
  createdAt: integer('created_at').notNull(),
});

export const readingCards = sqliteTable(
  'reading_cards',
  {
    readingId: text('reading_id')
      .notNull()
      .references(() => readings.id, { onDelete: 'cascade' }),
    positionIndex: integer('position_index').notNull(),
    positionKey: text('position_key').notNull(),
    cardId: text('card_id').notNull(), // validated against content, not an FK
    orientation: text('orientation', { enum: ['upright', 'reversed'] }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.readingId, table.positionIndex] }),
    unique().on(table.readingId, table.cardId), // no duplicate card in one reading
    check('reading_cards_orientation_check', sql`${table.orientation} IN ('upright','reversed')`),
  ],
);

export const journalEntries = sqliteTable(
  'journal_entries',
  {
    id: text('id').primaryKey(),
    readingId: text('reading_id')
      .unique() // 0..1 entry per reading
      .references(() => readings.id, { onDelete: 'cascade' }),
    cardId: text('card_id'), // the card a free reflection is about; validated against content
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    prompt: text('prompt'),
    tags: text('tags').notNull().default('[]'), // JSON array of strings
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('journal_entries_created_at').on(sql`${table.createdAt} DESC`)],
);

export const studyProgress = sqliteTable(
  'study_progress',
  {
    cardId: text('card_id').primaryKey(),
    box: integer('box').notNull().default(1),
    correctCount: integer('correct_count').notNull().default(0),
    incorrectCount: integer('incorrect_count').notNull().default(0),
    lastReviewedAt: integer('last_reviewed_at'),
    nextReviewAt: integer('next_review_at'),
  },
  (table) => [check('study_progress_box_check', sql`${table.box} BETWEEN 1 AND 5`)],
);

export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey(), // single row
    data: text('data').notNull(), // JSON, parsed with UserSettingsSchema
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [check('settings_single_row_check', sql`${table.id} = 1`)],
);
