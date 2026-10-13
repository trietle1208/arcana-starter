import Database from 'better-sqlite3';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyMigrations,
  backupSqlite,
  migrateDatabaseFile,
  openSqlite,
  pendingMigrations,
} from './sqlite';

const dirs: string[] = [];
const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'arcana-sqlite-'));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

describe('migrations', () => {
  it('are pending on a new file, applied once, then not pending', () => {
    const sqlite = openSqlite(join(tempDir(), 'a.db'));
    expect(pendingMigrations(sqlite)).toBe(1);
    applyMigrations(sqlite);
    expect(pendingMigrations(sqlite)).toBe(0);
    applyMigrations(sqlite); // running them again is harmless
    expect(pendingMigrations(sqlite)).toBe(0);
    sqlite.close();
  });

  it('create the folder of a database that does not exist yet', () => {
    const path = join(tempDir(), 'nested', 'deeper', 'a.db');
    openSqlite(path).close();
    expect(existsSync(path)).toBe(true);
  });
});

describe('file backup', () => {
  it('copies a live database, WAL and all, into one self-contained file', async () => {
    const dir = tempDir();
    const sqlite = openSqlite(join(dir, 'a.db'));
    applyMigrations(sqlite);
    sqlite.exec('INSERT INTO settings VALUES (1, \'{"locale":"vi"}\', 1)');

    const copy = await backupSqlite(
      sqlite,
      join(dir, 'backups'),
      'arcana',
      new Date(2026, 9, 13, 9, 42),
    );
    expect(copy).toBe(join(dir, 'backups', 'arcana-2026-10-13-0942.db'));
    expect(readdirSync(join(dir, 'backups'))).toEqual(['arcana-2026-10-13-0942.db']);

    const reopened = new Database(copy, { readonly: true });
    expect(reopened.prepare('SELECT data FROM settings').get()).toEqual({
      data: '{"locale":"vi"}',
    });
    reopened.close();
    sqlite.close();
  });
});

describe('migrateDatabaseFile', () => {
  const countBackups = (dir: string) => {
    try {
      return readdirSync(join(dir, 'backups')).filter((name) => name.startsWith('pre-migrate'));
    } catch {
      return [];
    }
  };

  it('creates a new database without a backup, and leaves it up to date', async () => {
    const dir = tempDir();
    const path = join(dir, 'arcana.db');
    expect(await migrateDatabaseFile(path)).toEqual({ applied: 1, backup: null });
    const sqlite = openSqlite(path);
    expect(pendingMigrations(sqlite)).toBe(0);
    sqlite.close();
    expect(countBackups(dir)).toEqual([]);
  });

  it('does nothing, and makes no backup, when nothing is pending: a restart is free', async () => {
    const dir = tempDir();
    const path = join(dir, 'arcana.db');
    await migrateDatabaseFile(path);
    expect(await migrateDatabaseFile(path)).toEqual({ applied: 0, backup: null });
    expect(await migrateDatabaseFile(path)).toEqual({ applied: 0, backup: null });
    expect(countBackups(dir)).toEqual([]);
  });

  it('copies a database that has data in it before applying a migration', async () => {
    const dir = tempDir();
    const path = join(dir, 'arcana.db');
    const old = openSqlite(path);
    old.exec("CREATE TABLE precious (note TEXT); INSERT INTO precious VALUES ('keep me')");
    old.close();

    const report = await migrateDatabaseFile(path, { now: new Date(2026, 9, 13, 9, 42) });
    expect(report.applied).toBe(1);
    expect(report.backup).toBe(join(dir, 'backups', 'pre-migrate-2026-10-13-0942.db'));
    const copy = new Database(report.backup!, { readonly: true });
    expect(copy.prepare('SELECT note FROM precious').get()).toEqual({ note: 'keep me' });
    copy.close();
    // And the real file kept its data and got the new tables.
    const live = openSqlite(path);
    expect(live.prepare('SELECT note FROM precious').get()).toEqual({ note: 'keep me' });
    expect(pendingMigrations(live)).toBe(0);
    live.close();
  });

  it('makes no backup of an empty file: there is nothing in it to lose', async () => {
    const dir = tempDir();
    const path = join(dir, 'arcana.db');
    openSqlite(path).close(); // what a server that never migrated leaves behind
    expect(await migrateDatabaseFile(path)).toEqual({ applied: 1, backup: null });
    expect(countBackups(dir)).toEqual([]);
  });
});
