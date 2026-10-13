// Plain SQLite file handling shared by the app, the db:* scripts and the integration tests.
//
// No `import 'server-only'` and no relative imports on purpose: the scripts run this file straight
// from Node (`node scripts/migrate.ts`), outside Next.js. Everything the app does with the
// connection goes through `client.ts`, which is server-only.
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type Sqlite = Database.Database;

export const DEFAULT_DB_PATH = './data/arcana.db';

/** Where the app, the scripts and the tests find the SQL migrations (relative to the cwd). */
export const MIGRATIONS_DIR = join(process.cwd(), 'drizzle');

/** Where backups of a database file go: `backups/` next to it. */
export function backupDirFor(dbPath: string): string {
  return join(dirname(dbPath), 'backups');
}

/** Opens (and creates) the database file with the pragmas every connection needs. */
export function openSqlite(path: string): Sqlite {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  // SQLite leaves foreign keys off by default; ON DELETE CASCADE depends on this.
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');
  return sqlite;
}

/** How many SQL migrations in `folder` this database has not applied yet. */
export function pendingMigrations(sqlite: Sqlite, folder: string = MIGRATIONS_DIR): number {
  const migrations = readMigrationFiles({ migrationsFolder: folder });
  const table = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'",
    )
    .get();
  if (!table) return migrations.length;
  const last = sqlite
    .prepare('SELECT created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1')
    .get() as { created_at: number } | undefined;
  return migrations.filter((m) => !last || m.folderMillis > last.created_at).length;
}

/** Applies every pending migration. Safe to run on every start: finished ones are skipped. */
export function applyMigrations(sqlite: Sqlite, folder: string = MIGRATIONS_DIR): void {
  migrate(drizzle(sqlite), { migrationsFolder: folder });
}

/** True when the database holds any table at all: an empty file has nothing worth a backup. */
function hasTables(sqlite: Sqlite): boolean {
  return (
    sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' LIMIT 1").get() !== undefined
  );
}

/** `2026-10-13-0942`, in the machine's local time. */
export function timestampLabel(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`
  );
}

/**
 * A consistent copy of a live database (SQLite's online backup API, WAL included), written to
 * `<dir>/<prefix>-<timestamp>.db`. Returns the path of the copy.
 */
export async function backupSqlite(
  sqlite: Sqlite,
  dir: string,
  prefix: string,
  now: Date = new Date(),
): Promise<string> {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `${prefix}-${timestampLabel(now)}.db`);
  await sqlite.backup(target);
  // The copy inherits WAL mode, which would leave -wal and -shm files beside it every time it is
  // opened. Switching it back makes a backup one self-contained file.
  const copy = new Database(target);
  try {
    copy.pragma('journal_mode = DELETE');
  } finally {
    copy.close();
  }
  return target;
}

export interface MigrationReport {
  /** How many migrations were waiting (and have now been applied). */
  applied: number;
  /** The copy made before applying them; null when there was nothing to protect. */
  backup: string | null;
}

/**
 * Brings a database file up to date: creates it if it is missing, and when migrations are pending
 * first copies what is in it to `backups/pre-migrate-<time>.db`. Nothing pending, nothing written:
 * restarting the server must not leave a new backup behind every time.
 *
 * `pnpm db:migrate` runs this before dev and start; the server runs it again as it boots, which is
 * how the production image (that has no pnpm to run a script) gets its database.
 */
export async function migrateDatabaseFile(
  dbPath: string,
  { folder = MIGRATIONS_DIR, now = new Date() }: { folder?: string; now?: Date } = {},
): Promise<MigrationReport> {
  const existed = existsSync(dbPath);
  const sqlite = openSqlite(dbPath);
  try {
    const pending = pendingMigrations(sqlite, folder);
    if (pending === 0) return { applied: 0, backup: null };
    const backup =
      existed && hasTables(sqlite)
        ? await backupSqlite(sqlite, backupDirFor(dbPath), 'pre-migrate', now)
        : null;
    applyMigrations(sqlite, folder);
    return { applied: pending, backup };
  } finally {
    sqlite.close();
  }
}
