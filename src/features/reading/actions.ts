'use server';

import { revalidatePath } from 'next/cache';
import { saveReading } from '@/application/readings/saveReading';
import { getDb } from '@/server/db/client';
import { runAction, uiErrorOf, type ActionResult } from '../actionResult';

/** Saves a drawn reading, with the reader's title, notes and tags, to the journal. */
export async function saveReadingAction(
  input: unknown,
): Promise<ActionResult<{ entryId: string }>> {
  const result = runAction(() => saveReading(getDb(), input));
  if (!result.ok) return { ok: false, error: uiErrorOf(result) };
  revalidatePath('/journal');
  return { ok: true, entryId: result.value.entryId };
}
