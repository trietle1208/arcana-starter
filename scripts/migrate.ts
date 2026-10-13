// pnpm db:migrate — runs before `pnpm dev` and `pnpm start` (predev / prestart).
// Creates the database file if it is missing and applies the pending migrations, after copying
// the existing data to data/backups/pre-migrate-<time>.db (see migrateDatabaseFile).
import { migrateDatabaseFile } from '../src/server/db/sqlite.ts';
import { dbPath } from './lib/config.ts';

const { applied, backup } = await migrateDatabaseFile(dbPath);
if (backup) console.log(`[db:migrate] Backed up the database to ${backup}`);
console.log(
  applied === 0
    ? `[db:migrate] ${dbPath} is up to date.`
    : `[db:migrate] Applied ${applied} migration${applied === 1 ? '' : 's'} to ${dbPath}.`,
);
