import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openTempDb, type TempDb } from './testing';

// The schema of docs/TECH_DESIGN.md §5.3, checked against the database the migrations build.
let temp: TempDb;
beforeAll(() => {
  temp = openTempDb();
});
afterAll(() => temp.cleanup());

interface Column {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}
const columns = (table: string) =>
  Object.fromEntries(
    (temp.sqlite.prepare(`PRAGMA table_info(${table})`).all() as Column[]).map((c) => [c.name, c]),
  );

describe('the schema', () => {
  it('has the five tables and nothing for cards or spreads', () => {
    const tables = (
      temp.sqlite
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE '\\_\\_%' ESCAPE '\\'",
        )
        .all() as { name: string }[]
    ).map((row) => row.name);
    expect(tables.sort()).toEqual([
      'journal_entries',
      'reading_cards',
      'readings',
      'settings',
      'study_progress',
    ]);
  });

  it('readings', () => {
    const c = columns('readings');
    expect(Object.keys(c)).toEqual([
      'id',
      'spread_id',
      'spread_version',
      'question',
      'drawn_at',
      'created_at',
    ]);
    expect(c.id.pk).toBe(1);
    expect(c.question.notnull).toBe(0);
    for (const name of ['spread_id', 'spread_version', 'drawn_at', 'created_at']) {
      expect(c[name].notnull, name).toBe(1);
    }
  });

  it('reading_cards: composite key, cascade, unique card per reading, orientation check', () => {
    const c = columns('reading_cards');
    expect(Object.keys(c)).toEqual([
      'reading_id',
      'position_index',
      'position_key',
      'card_id',
      'orientation',
    ]);
    expect(c.reading_id.pk).toBe(1);
    expect(c.position_index.pk).toBe(2);
    const fks = temp.sqlite.prepare('PRAGMA foreign_key_list(reading_cards)').all() as {
      table: string;
      from: string;
      on_delete: string;
    }[];
    expect(fks).toMatchObject([{ table: 'readings', from: 'reading_id', on_delete: 'CASCADE' }]);
    const unique = (
      temp.sqlite.prepare('PRAGMA index_list(reading_cards)').all() as {
        name: string;
        unique: number;
      }[]
    ).filter((index) => index.unique && index.name.includes('card_id'));
    expect(unique).toHaveLength(1);
    const cols = (
      temp.sqlite.prepare(`PRAGMA index_info(${unique[0].name})`).all() as { name: string }[]
    ).map((col) => col.name);
    expect(cols).toEqual(['reading_id', 'card_id']);
  });

  it('journal_entries: optional unique reading, defaults, newest-first index', () => {
    const c = columns('journal_entries');
    expect(Object.keys(c)).toEqual([
      'id',
      'reading_id',
      'card_id',
      'title',
      'body',
      'prompt',
      'tags',
      'created_at',
      'updated_at',
    ]);
    expect(c.reading_id.notnull).toBe(0);
    expect(c.card_id.notnull).toBe(0);
    expect(c.title.notnull).toBe(1);
    expect(c.body).toMatchObject({ notnull: 1, dflt_value: "''" });
    expect(c.tags).toMatchObject({ notnull: 1, dflt_value: "'[]'" });
    const fks = temp.sqlite.prepare('PRAGMA foreign_key_list(journal_entries)').all() as {
      table: string;
      on_delete: string;
    }[];
    expect(fks).toMatchObject([{ table: 'readings', on_delete: 'CASCADE' }]);
    const indexes = temp.sqlite.prepare('PRAGMA index_list(journal_entries)').all() as {
      name: string;
      unique: number;
    }[];
    expect(indexes.some((index) => index.unique === 1)).toBe(true);
    const byDate = temp.sqlite
      .prepare("SELECT sql FROM sqlite_master WHERE name = 'journal_entries_created_at'")
      .get() as { sql: string };
    expect(byDate.sql).toMatch(/created_at"? DESC/);
  });

  it('study_progress and settings', () => {
    expect(Object.keys(columns('study_progress'))).toEqual([
      'card_id',
      'box',
      'correct_count',
      'incorrect_count',
      'last_reviewed_at',
      'next_review_at',
    ]);
    expect(columns('study_progress').box.dflt_value).toBe('1');
    expect(Object.keys(columns('settings'))).toEqual(['id', 'data', 'updated_at']);
  });

  it('enforces the constraints it declares', () => {
    const { sqlite } = temp;
    sqlite.exec("INSERT INTO readings VALUES ('r1', 'three-card', 1, NULL, 1, 1)");
    const card = (orientation: string, cardId = 'the-fool', index = 0) =>
      sqlite
        .prepare("INSERT INTO reading_cards VALUES ('r1', ?, 'past', ?, ?)")
        .run(index, cardId, orientation);
    expect(() => card('sideways')).toThrow(/CHECK/);
    card('upright');
    expect(() => card('upright', 'the-fool', 1)).toThrow(/UNIQUE/);
    expect(() =>
      sqlite.exec("INSERT INTO reading_cards VALUES ('nope', 0, 'past', 'the-sun', 'upright')"),
    ).toThrow(/FOREIGN KEY/);
    expect(() => sqlite.exec("INSERT INTO study_progress (card_id, box) VALUES ('x', 6)")).toThrow(
      /CHECK/,
    );
    expect(() => sqlite.exec("INSERT INTO settings VALUES (2, '{}', 1)")).toThrow(/CHECK/);
    sqlite.exec("DELETE FROM readings WHERE id = 'r1'");
    expect(sqlite.prepare('SELECT count(*) AS n FROM reading_cards').get()).toEqual({ n: 0 });
  });

  it('runs in WAL mode with foreign keys on', () => {
    expect(temp.sqlite.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(temp.sqlite.pragma('foreign_keys', { simple: true })).toBe(1);
  });
});
