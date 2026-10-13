import 'server-only';
import { env } from './env';
import { migrateDatabaseFile } from './db/sqlite';

/**
 * Runs when the server boots (see instrumentation.ts): brings the database up to date. `pnpm dev`
 * and `pnpm start` have already done it through db:migrate, so there it finds nothing to do; the
 * production image has no pnpm, and this is how its database gets created and migrated.
 */
export async function migrateOnStart(): Promise<void> {
  const { applied, backup } = await migrateDatabaseFile(env.ARCANA_DB_PATH);
  if (backup) console.log(`[arcana] Backed up the database to ${backup}`);
  if (applied > 0) {
    console.log(`[arcana] Applied ${applied} migration${applied === 1 ? '' : 's'}.`);
  }
}
