import type { Failure, Result } from '@/application/result';
import type { TranslationKey } from '@/i18n';

/** What a Server Action tells the form: the reader-facing reason, not the internal error code. */
export type UiError = 'title' | 'tags' | 'invalid' | 'not-found' | 'storage';

export type ActionResult<T extends object = object> =
  ({ ok: true } & T) | { ok: false; error: UiError };

export const UI_ERROR_KEY: Record<UiError, TranslationKey> = {
  title: 'error.title',
  tags: 'error.tags',
  invalid: 'error.invalid',
  'not-found': 'error.notFound',
  storage: 'error.storage',
};

export function toUiError(failure: Failure): UiError {
  if (failure.error === 'not-found') return 'not-found';
  if (failure.error === 'invalid-input' && failure.field === 'title') return 'title';
  if (failure.error === 'invalid-input' && failure.field === 'tags') return 'tags';
  return 'invalid';
}

/**
 * Runs a use case for a Server Action. A rule the reader broke becomes an error to show; anything
 * that throws (the disk, a bug) is logged and shown as a failed save, never as a crashed page.
 */
export function runAction<T>(work: () => Result<T>): Result<T> | { ok: false; error: 'storage' } {
  try {
    return work();
  } catch (error) {
    console.error(error);
    return { ok: false, error: 'storage' };
  }
}

/** The use case's Failure, or the 'storage' marker `runAction` returns, as a UiError. */
export function uiErrorOf(failure: { ok: false; error: string; field?: string }): UiError {
  return failure.error === 'storage' ? 'storage' : toUiError(failure as Failure);
}
