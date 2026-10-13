/**
 * What a use case reports instead of throwing: callers (Server Actions) turn the code into a
 * message the reader can act on. Bugs and storage failures still throw.
 */
export type ErrorCode =
  | 'invalid-input'
  | 'unknown-spread'
  | 'unknown-card'
  | 'spread-mismatch'
  | 'duplicate-card'
  | 'not-found';

export type Failure = { ok: false; error: ErrorCode; field?: string };
export type Result<T> = { ok: true; value: T } | Failure;

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = (error: ErrorCode, field?: string): Failure => ({ ok: false, error, field });
