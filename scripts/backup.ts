// pnpm db:backup — a consistent copy of the database in data/backups/arcana-<time>.db.
// Safe while the app is running (SQLite's online backup API).
import { existsSync } from 'node:fs';
import { backupDirFor, backupSqlite, openSqlite } from '../src/server/db/sqlite.ts';
import { dbPath } from './lib/config.ts';

if (!existsSync(dbPath)) {
  console.error(`[db:backup] There is no database at ${dbPath} yet.`);
  process.exit(1);
}

const sqlite = openSqlite(dbPath);
try {
  const copy = await backupSqlite(sqlite, backupDirFor(dbPath), 'arcana');
  console.log(`[db:backup] Saved ${copy}`);
} finally {
  sqlite.close();
}
