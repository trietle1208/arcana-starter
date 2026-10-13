import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Where this run keeps its throw-away databases. The Playwright config sets ARCANA_E2E_RUN once,
 * in the main process; the workers inherit it, so everyone agrees on the folder.
 */
export function e2eDataDir(): string {
  process.env.ARCANA_E2E_RUN ??= String(Date.now());
  return join(tmpdir(), `arcana-e2e-${process.env.ARCANA_E2E_RUN}`);
}
