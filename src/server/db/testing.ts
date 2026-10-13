// Helpers for integration tests: a real SQLite file in a temp folder with the real migrations
// applied, so repositories and use cases are tested against the schema the app ships.
import 'server-only';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDb, type Db } from './client';
import { applyMigrations, openSqlite, type Sqlite } from './sqlite';

export interface TempDb {
  path: string;
  sqlite: Sqlite;
  db: Db;
  /** Closes the handle and opens a new one on the same file, as a server restart would. */
  reopen: () => TempDb;
  /** Closes the handle and deletes the folder. */
  cleanup: () => void;
}

function wrap(dir: string, path: string, sqlite: Sqlite): TempDb {
  return {
    path,
    sqlite,
    db: createDb(sqlite),
    reopen() {
      sqlite.close();
      return wrap(dir, path, openSqlite(path));
    },
    cleanup() {
      if (sqlite.open) sqlite.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

export function openTempDb(): TempDb {
  const dir = mkdtempSync(join(tmpdir(), 'arcana-test-'));
  const path = join(dir, 'arcana.db');
  const sqlite = openSqlite(path);
  applyMigrations(sqlite);
  return wrap(dir, path, sqlite);
}
