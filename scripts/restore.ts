// pnpm db:restore <file> — puts a backup back in place of the database. Stop the app first.
// The current database is backed up to data/backups/pre-restore-<time>.db before it is replaced.
import Database from 'better-sqlite3';
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { backupDirFor, backupSqlite, openSqlite } from '../src/server/db/sqlite.ts';
import { dbPath } from './lib/config.ts';

const source = process.argv[2];
if (!source) {
  console.error('[db:restore] Usage: pnpm db:restore <backup file>');
  process.exit(1);
}
const file = resolve(source);
if (!existsSync(file)) {
  console.error(`[db:restore] ${file} does not exist.`);
  process.exit(1);
}
if (resolve(dbPath) === file) {
  console.error(
    '[db:restore] The backup is the live database itself; pick a file in data/backups/.',
  );
  process.exit(1);
}

// Check the file is a healthy SQLite database before anything is replaced.
const header = readFileSync(file).subarray(0, 16).toString('latin1');
if (!header.startsWith('SQLite format 3')) {
  console.error(`[db:restore] ${file} is not a SQLite database.`);
  process.exit(1);
}
const probe = new Database(file, { readonly: true, fileMustExist: true });
try {
  const check = probe.pragma('integrity_check', { simple: true });
  if (check !== 'ok') {
    console.error(`[db:restore] ${file} failed the integrity check: ${String(check)}`);
    process.exit(1);
  }
} finally {
  probe.close();
}

if (existsSync(dbPath)) {
  const current = openSqlite(dbPath);
  try {
    const copy = await backupSqlite(current, backupDirFor(dbPath), 'pre-restore');
    console.log(`[db:restore] Backed up the current database to ${copy}`);
  } finally {
    current.close();
  }
}
// A leftover write-ahead log belongs to the old file and would corrupt the restored one.
for (const suffix of ['-wal', '-shm']) rmSync(`${dbPath}${suffix}`, { force: true });
copyFileSync(file, dbPath);
console.log(`[db:restore] Restored ${file} to ${dbPath}. Start the app again.`);
