import 'server-only';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { env } from '@/server/env';
import * as schema from './schema';
import { openSqlite, type Sqlite } from './sqlite';

export type Db = BetterSQLite3Database<typeof schema>;
/** The transaction handle `db.transaction()` passes in. It has the same query methods as `Db`. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
/** What a repository function accepts: the connection or a transaction on it. */
export type DbOrTx = Db | Tx;

/** Wraps an open SQLite handle (a temp file in tests, the real file in the app). */
export function createDb(sqlite: Sqlite): Db {
  return drizzle(sqlite, { schema });
}

// One connection per server process. Next.js reloads modules in development, so the handle is
// kept on globalThis instead of in a module variable.
const globalForDb = globalThis as typeof globalThis & { __arcanaDb?: Db };

/** The app's connection (the file from ARCANA_DB_PATH). Server code only; migrations ran first. */
export function getDb(): Db {
  globalForDb.__arcanaDb ??= createDb(openSqlite(env.ARCANA_DB_PATH));
  return globalForDb.__arcanaDb;
}
