import 'server-only';
import { asc } from 'drizzle-orm';
import type { StudyProgress } from '@/domain/records';
import type { DbOrTx } from '@/server/db/client';
import { studyProgress } from '@/server/db/schema';

// Phase 3 only needs the study table to travel with a backup. Phase 4 adds the Leitner updates.

type Row = typeof studyProgress.$inferSelect;

const toDate = (ms: number | null) => (ms === null ? null : new Date(ms));

const toProgress = (row: Row): StudyProgress => ({
  cardId: row.cardId,
  box: row.box as StudyProgress['box'],
  correctCount: row.correctCount,
  incorrectCount: row.incorrectCount,
  lastReviewedAt: toDate(row.lastReviewedAt),
  nextReviewAt: toDate(row.nextReviewAt),
});

export function listStudyProgress(db: DbOrTx): StudyProgress[] {
  return db.select().from(studyProgress).orderBy(asc(studyProgress.cardId)).all().map(toProgress);
}

/** Returns false, writing nothing, when this card already has a row. */
export function insertStudyProgress(db: DbOrTx, progress: StudyProgress): boolean {
  return (
    db
      .insert(studyProgress)
      .values({
        cardId: progress.cardId,
        box: progress.box,
        correctCount: progress.correctCount,
        incorrectCount: progress.incorrectCount,
        lastReviewedAt: progress.lastReviewedAt?.getTime() ?? null,
        nextReviewAt: progress.nextReviewAt?.getTime() ?? null,
      })
      .onConflictDoNothing()
      .run().changes > 0
  );
}
