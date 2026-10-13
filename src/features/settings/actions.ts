'use server';

import { revalidatePath } from 'next/cache';
import { importBackup } from '@/application/backup/backup';
import { saveSettings } from '@/application/settings/settings';
import { getDb } from '@/server/db/client';
import { runAction, uiErrorOf, type ActionResult } from '../actionResult';

/** Saves part of the settings. The whole app re-renders, so the language and motion apply at once. */
export async function saveSettingsAction(patch: unknown): Promise<ActionResult> {
  const result = runAction(() => saveSettings(getDb(), patch));
  if (!result.ok) return { ok: false, error: uiErrorOf(result) };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export type ImportState =
  | { status: 'idle' }
  | { status: 'done'; added: number; skipped: number }
  | { status: 'error'; reason: 'file' | 'invalid' | 'size' | 'storage' };

/** The backup file is plain JSON, a few hundred kB for years of entries; this is a generous cap. */
const MAX_BACKUP_BYTES = 8 * 1024 * 1024;

/** Reads an uploaded export back in (see application/backup). Used with `useActionState`. */
export async function importBackupAction(
  _previous: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { status: 'error', reason: 'file' };
  if (file.size > MAX_BACKUP_BYTES) return { status: 'error', reason: 'size' };

  let text: string;
  try {
    text = await file.text();
  } catch (error) {
    console.error(error);
    return { status: 'error', reason: 'file' };
  }
  const result = runAction(() => importBackup(getDb(), text));
  if (!result.ok) {
    return { status: 'error', reason: result.error === 'storage' ? 'storage' : 'invalid' };
  }
  // Entries, readings and perhaps the settings changed: refresh everything.
  revalidatePath('/', 'layout');
  return {
    status: 'done',
    added: result.value.entriesAdded,
    skipped: result.value.entriesSkipped,
  };
}
