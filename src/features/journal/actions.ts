'use server';

import { revalidatePath } from 'next/cache';
import {
  createReflection,
  deleteJournalEntry,
  restoreJournalEntry,
  updateJournalEntry,
  type JournalSnapshot,
} from '@/application/journal/journal';
import { getDb } from '@/server/db/client';
import { runAction, uiErrorOf, type ActionResult } from '../actionResult';

/** Changes the title, notes and tags of an entry. */
export async function updateEntryAction(input: unknown): Promise<ActionResult> {
  const result = runAction(() => updateJournalEntry(getDb(), input));
  if (!result.ok) return { ok: false, error: uiErrorOf(result) };
  revalidatePath('/journal');
  revalidatePath(`/journal/${result.value.id}`);
  return { ok: true };
}

/**
 * Deletes an entry (and its reading) and hands back what it removed, so the page can offer Undo.
 *
 * Nothing is revalidated here on purpose. A Server Action that revalidates any path also sends
 * back a fresh render of the page the reader is on, and that page is this entry's, which no longer
 * exists: it would turn into a 404 under the Undo notice. The journal list needs no revalidation
 * either: it is rendered per request and a link to it always fetches it again.
 */
export async function deleteEntryAction(
  id: string,
): Promise<ActionResult<{ snapshot: JournalSnapshot }>> {
  const result = runAction(() => deleteJournalEntry(getDb(), id));
  if (!result.ok) return { ok: false, error: uiErrorOf(result) };
  return { ok: true, snapshot: result.value };
}

/** Undo: puts back what `deleteEntryAction` removed. */
export async function restoreEntryAction(snapshot: unknown): Promise<ActionResult> {
  const result = runAction(() => restoreJournalEntry(getDb(), snapshot));
  if (!result.ok) return { ok: false, error: uiErrorOf(result) };
  revalidatePath('/journal');
  revalidatePath(`/journal/${result.value.entryId}`);
  return { ok: true };
}

/** A free reflection: an entry with no reading, optionally about one card. */
export async function createReflectionAction(
  input: unknown,
): Promise<ActionResult<{ entryId: string }>> {
  const result = runAction(() => createReflection(getDb(), input));
  if (!result.ok) return { ok: false, error: uiErrorOf(result) };
  revalidatePath('/journal');
  return { ok: true, entryId: result.value.entryId };
}
