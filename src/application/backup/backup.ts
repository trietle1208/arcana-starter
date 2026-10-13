import { z } from 'zod';
import { hasCard } from '@/content';
import type { JournalEntry, StudyProgress, UserSettings } from '@/domain/records';
import type { Db } from '@/server/db/client';
import { insertEntry, listEntries } from '@/server/repositories/journal';
import { insertReading, listReadings } from '@/server/repositories/readings';
import { readSettingsJson, writeSettingsJson } from '@/server/repositories/settings';
import { insertStudyProgress, listStudyProgress } from '@/server/repositories/study';
import { resolveDeps, type Deps } from '../deps';
import { JournalEntrySchema, ReadingSchema } from '../journal/schemas';
import { checkReading } from '../readings/checkReading';
import { fail, ok, type Result } from '../result';
import { getSettings } from '../settings/settings';
import { UserSettingsSchema } from '../settings/schema';

// The portable export of docs/TECH_DESIGN.md §9: human-readable JSON that does not depend on the
// database file, so it survives schema changes. Dates are ISO strings.

export const BACKUP_VERSION = 1;

const BackupReadingSchema = ReadingSchema.extend({ createdAt: z.coerce.date().optional() });

const BackupStudySchema = z
  .object({
    cardId: z.string().min(1).max(64),
    box: z.number().int().min(1).max(5),
    correctCount: z.number().int().min(0),
    incorrectCount: z.number().int().min(0),
    lastReviewedAt: z.coerce.date().nullable(),
    nextReviewAt: z.coerce.date().nullable(),
  })
  .strict();

export const BackupFileSchema = z
  .object({
    version: z.literal(BACKUP_VERSION),
    exportedAt: z.coerce.date(),
    readings: z.array(BackupReadingSchema),
    journalEntries: z.array(JournalEntrySchema),
    studyProgress: z.array(BackupStudySchema),
    settings: UserSettingsSchema.nullable(),
  })
  .strict();

export interface BackupFile {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  readings: unknown[];
  journalEntries: unknown[];
  studyProgress: unknown[];
  settings: UserSettings | null;
}

/** Everything the reader has written, as one JSON-ready object. */
export function exportBackup(db: Db, deps: Partial<Deps> = {}): BackupFile {
  const { now } = resolveDeps(deps);
  return JSON.parse(
    JSON.stringify({
      version: BACKUP_VERSION,
      exportedAt: now(),
      readings: listReadings(db).map(({ reading, createdAt }) => ({ ...reading, createdAt })),
      journalEntries: listEntries(db),
      studyProgress: listStudyProgress(db),
      // Settings are exported as they read now; a store that was never written exports null.
      settings: readSettingsJson(db) === null ? null : getSettings(db),
    } satisfies Record<string, unknown>),
  ) as BackupFile;
}

export interface ImportSummary {
  readingsAdded: number;
  entriesAdded: number;
  /** Entries left alone because the journal already had them. */
  entriesSkipped: number;
  studyAdded: number;
  settingsApplied: boolean;
}

/**
 * Reads an export back in, in one transaction, skipping what already exists (by id). Nothing is
 * written unless the whole file is valid: the shape, every card and spread id, and every entry's
 * reading. The saved settings are only taken when this database has none yet.
 */
export function importBackup(db: Db, text: string): Result<ImportSummary> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail('invalid-input');
  }
  const parsed = BackupFileSchema.safeParse(raw);
  if (!parsed.success) return fail('invalid-input', String(parsed.error.issues[0]?.path[0] ?? ''));
  const file = parsed.data;

  const readingIds = new Set<string>();
  for (const reading of file.readings) {
    if (readingIds.has(reading.id)) return fail('invalid-input', 'readings');
    readingIds.add(reading.id);
    const problem = checkReading(reading, { strict: false });
    if (problem) return problem;
  }
  const entryIds = new Set<string>();
  for (const entry of file.journalEntries) {
    if (entryIds.has(entry.id)) return fail('invalid-input', 'journalEntries');
    entryIds.add(entry.id);
    if (entry.readingId !== null && !readingIds.has(entry.readingId)) {
      return fail('invalid-input', 'journalEntries');
    }
    if (entry.cardId !== null && !hasCard(entry.cardId)) return fail('unknown-card');
  }
  for (const progress of file.studyProgress) {
    if (!hasCard(progress.cardId)) return fail('unknown-card');
  }

  return ok(
    db.transaction((tx) => {
      const summary: ImportSummary = {
        readingsAdded: 0,
        entriesAdded: 0,
        entriesSkipped: 0,
        studyAdded: 0,
        settingsApplied: false,
      };
      for (const { createdAt, ...reading } of file.readings) {
        if (insertReading(tx, reading, createdAt ?? reading.drawnAt)) summary.readingsAdded += 1;
      }
      for (const entry of file.journalEntries satisfies JournalEntry[]) {
        if (insertEntry(tx, entry)) summary.entriesAdded += 1;
        else summary.entriesSkipped += 1;
      }
      for (const progress of file.studyProgress) {
        const row: StudyProgress = { ...progress, box: progress.box as StudyProgress['box'] };
        if (insertStudyProgress(tx, row)) summary.studyAdded += 1;
      }
      if (file.settings && readSettingsJson(tx) === null) {
        writeSettingsJson(tx, JSON.stringify(file.settings), new Date());
        summary.settingsApplied = true;
      }
      return summary;
    }),
  );
}
