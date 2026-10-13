import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { openTempDb, type TempDb } from '@/server/db/testing';
import { createReflection } from '../journal/journal';
import { saveReading } from '../readings/saveReading';
import { getSettings, saveSettings } from '../settings/settings';
import { fixedDeps, sampleReading } from '../testing';
import { exportBackup, importBackup } from './backup';

let temp: TempDb;
beforeAll(() => {
  temp = openTempDb();
});
afterAll(() => temp.cleanup());
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const TABLES = ['readings', 'reading_cards', 'journal_entries', 'study_progress', 'settings'];
// Every row of every table. The settings row's updated_at is bookkeeping, not data: the export
// carries the settings, not when they were last saved, so an import stamps its own time.
function dump() {
  return Object.fromEntries(
    TABLES.map((table) => {
      const rows = temp.sqlite.prepare(`SELECT * FROM ${table} ORDER BY 1, 2`).all() as Record<
        string,
        unknown
      >[];
      return [
        table,
        table === 'settings'
          ? rows.map(({ updated_at, ...rest }) => (void updated_at, rest))
          : rows,
      ];
    }),
  );
}
const wipe = () =>
  temp.sqlite.exec(
    'DELETE FROM readings; DELETE FROM journal_entries; DELETE FROM study_progress; DELETE FROM settings;',
  );
const total = () =>
  TABLES.reduce(
    (n, t) => n + (temp.sqlite.prepare(`SELECT count(*) c FROM ${t}`).get() as { c: number }).c,
    0,
  );

function fill() {
  wipe();
  saveReading(
    temp.db,
    { reading: sampleReading('three-card', 5), title: 'One', body: 'a', tags: ['Work'] },
    fixedDeps('2026-10-01T09:30:00.123Z'),
  );
  saveReading(
    temp.db,
    { reading: sampleReading('celtic-cross', 6), title: 'Two', tags: ['Calm', 'Friends'] },
    fixedDeps('2026-10-05T18:00:00.000Z'),
  );
  createReflection(temp.db, { title: 'Three', cardId: 'the-sun', prompt: 'Why?' }, fixedDeps());
  saveSettings(temp.db, { locale: 'vi', includeReversed: false, interpretationDetail: 'full' });
  temp.sqlite.exec(
    "INSERT INTO study_progress VALUES ('the-fool', 3, 4, 1, 1759000000000, 1759500000000), ('cups-ace', 1, 0, 2, NULL, NULL)",
  );
}

describe('JSON export and import', () => {
  it('round-trips: export, wipe, import gives identical rows', () => {
    fill();
    const before = dump();
    expect(total()).toBeGreaterThan(10);

    const file = JSON.stringify(exportBackup(temp.db));
    wipe();
    expect(total()).toBe(0);

    const result = importBackup(temp.db, file);
    expect(result).toEqual({
      ok: true,
      value: {
        readingsAdded: 2,
        entriesAdded: 3,
        entriesSkipped: 0,
        studyAdded: 2,
        settingsApplied: true,
      },
    });
    expect(dump()).toEqual(before);
  });

  it('names its version and when it was made, and is plain JSON', () => {
    fill();
    const file = exportBackup(temp.db, { now: () => new Date('2026-10-13T09:00:00.000Z') });
    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe('2026-10-13T09:00:00.000Z');
    expect(Object.keys(file)).toEqual([
      'version',
      'exportedAt',
      'readings',
      'journalEntries',
      'studyProgress',
      'settings',
    ]);
    expect(file.settings).toMatchObject({ locale: 'vi' });
  });

  it('exports null settings for a database that never saved any', () => {
    wipe();
    expect(exportBackup(temp.db).settings).toBeNull();
  });

  it('skips what already exists, so importing twice adds nothing', () => {
    fill();
    const file = JSON.stringify(exportBackup(temp.db));
    const before = dump();
    const result = importBackup(temp.db, file);
    expect(result).toEqual({
      ok: true,
      value: {
        readingsAdded: 0,
        entriesAdded: 0,
        entriesSkipped: 3,
        studyAdded: 0,
        settingsApplied: false,
      },
    });
    expect(dump()).toEqual(before);
  });

  it('adds only the missing entries when some are already there, and keeps the current settings', () => {
    fill();
    const file = exportBackup(temp.db);
    const withReading = file.journalEntries.find(
      (entry) => (entry as { readingId: unknown }).readingId,
    );
    temp.sqlite
      .prepare('DELETE FROM readings WHERE id = ?')
      .run((withReading as { readingId: string }).readingId);
    saveSettings(temp.db, { locale: 'en' });

    const result = importBackup(temp.db, JSON.stringify(file));
    expect(result).toMatchObject({
      ok: true,
      value: { readingsAdded: 1, entriesAdded: 1, entriesSkipped: 2, settingsApplied: false },
    });
    expect(getSettings(temp.db).locale).toBe('en');
  });

  describe('rejects a malformed file without writing anything', () => {
    const good = () => {
      fill();
      return exportBackup(temp.db) as unknown as Record<string, unknown[]> & {
        readings: Record<string, unknown>[];
        journalEntries: Record<string, unknown>[];
      };
    };
    const rejectsText = (text: string) => {
      wipe();
      expect(importBackup(temp.db, text)).toMatchObject({ ok: false, error: 'invalid-input' });
      expect(total()).toBe(0);
    };
    const rejects = (mutate: (file: ReturnType<typeof good>) => void, error = 'invalid-input') => {
      const file = good();
      mutate(file);
      wipe();
      expect(importBackup(temp.db, JSON.stringify(file))).toMatchObject({ ok: false, error });
      expect(total()).toBe(0);
    };

    it('that is not JSON, or not a backup', () => {
      rejectsText('{"version": 1,');
      rejectsText('[]');
      rejectsText('"hello"');
      rejectsText('');
      rejects((file) => {
        delete (file as Partial<typeof file>).readings;
      });
    });

    it('from another version', () => {
      rejects((file) => {
        (file as unknown as { version: number }).version = 2;
      });
    });

    it('with an unknown card or spread', () => {
      rejects((file) => {
        (file.readings[0].cards as { cardId: string }[])[0].cardId = 'the-dragon';
      }, 'unknown-card');
      rejects((file) => {
        file.readings[0].spreadId = 'horseshoe';
      }, 'unknown-spread');
    });

    it('with the same card twice, or an entry whose reading is not in the file', () => {
      rejects((file) => {
        const cards = file.readings[0].cards as { cardId: string }[];
        cards[1].cardId = cards[0].cardId;
      }, 'duplicate-card');
      rejects((file) => {
        file.journalEntries[0].readingId = '55555555-5555-4555-8555-555555555555';
      });
    });

    it('with the same id twice, an empty title or a bad date', () => {
      rejects((file) => {
        file.journalEntries.push({ ...file.journalEntries[0] });
      });
      rejects((file) => {
        file.journalEntries[0].title = '';
      });
      rejects((file) => {
        file.readings[0].drawnAt = 'yesterday-ish';
      });
    });

    it('where even one entry is bad, nothing from the good ones is written either', () => {
      rejects((file) => {
        file.journalEntries[2].cardId = 'the-dragon';
      }, 'unknown-card');
    });
  });
});
