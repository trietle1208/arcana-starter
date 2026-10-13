import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { openTempDb, type TempDb } from '@/server/db/testing';
import { fixedDeps } from '../testing';
import { getSettings, parseSettings, saveSettings } from './settings';

let temp: TempDb;
beforeAll(() => {
  temp = openTempDb();
});
afterAll(() => temp.cleanup());
beforeEach(() => {
  temp.sqlite.exec('DELETE FROM settings');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const store = (json: string) =>
  temp.sqlite.prepare('INSERT INTO settings VALUES (1, ?, 1)').run(json);

describe('getSettings', () => {
  it('returns the defaults when nothing has been saved', () => {
    expect(getSettings(temp.db)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toEqual({
      locale: 'en',
      theme: 'paper',
      includeReversed: true,
      revealOneByOne: true,
      defaultSpreadId: 'three-card',
      displayName: null,
      reduceMotion: 'system',
      interpretationDetail: 'brief',
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('falls back to the defaults, and logs it, when the stored JSON is invalid', () => {
    store('{not json');
    expect(getSettings(temp.db)).toEqual(DEFAULT_SETTINGS);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('falls back to the defaults when the stored JSON is not an object', () => {
    for (const json of ['null', '[]', '"vi"', '42']) {
      temp.sqlite.exec('DELETE FROM settings');
      store(json);
      expect(getSettings(temp.db), json).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('keeps what is valid and replaces only the fields that are missing or damaged', () => {
    store(
      JSON.stringify({
        locale: 'vi',
        includeReversed: false,
        reduceMotion: 'sometimes',
        defaultSpreadId: 'horseshoe',
        extra: 'ignored',
      }),
    );
    expect(getSettings(temp.db)).toEqual({
      ...DEFAULT_SETTINGS,
      locale: 'vi',
      includeReversed: false,
    });
  });

  it('never throws when the table cannot be read', () => {
    temp.sqlite.exec('ALTER TABLE settings RENAME TO settings_gone');
    try {
      expect(getSettings(temp.db)).toEqual(DEFAULT_SETTINGS);
      expect(console.error).toHaveBeenCalled();
    } finally {
      temp.sqlite.exec('ALTER TABLE settings_gone RENAME TO settings');
    }
  });
});

describe('parseSettings', () => {
  it('reads a complete, valid object as it is', () => {
    const all = {
      ...DEFAULT_SETTINGS,
      locale: 'vi' as const,
      displayName: 'Binh',
      reduceMotion: 'on' as const,
      interpretationDetail: 'full' as const,
      defaultSpreadId: 'celtic-cross',
    };
    expect(parseSettings(JSON.stringify(all))).toEqual(all);
  });
});

describe('saveSettings', () => {
  it('merges a patch into the stored settings and keeps the rest', () => {
    saveSettings(temp.db, { locale: 'vi' }, fixedDeps());
    saveSettings(temp.db, { includeReversed: false }, fixedDeps());
    expect(getSettings(temp.db)).toEqual({
      ...DEFAULT_SETTINGS,
      locale: 'vi',
      includeReversed: false,
    });
    expect(temp.sqlite.prepare('SELECT count(*) AS n FROM settings').get()).toEqual({ n: 1 });
  });

  it('returns the settings it saved', () => {
    const result = saveSettings(temp.db, { reduceMotion: 'on', defaultSpreadId: 'one-card' });
    expect(result).toEqual({
      ok: true,
      value: { ...DEFAULT_SETTINGS, reduceMotion: 'on', defaultSpreadId: 'one-card' },
    });
  });

  it('rejects a bad value or an unknown key and leaves the stored settings alone', () => {
    saveSettings(temp.db, { locale: 'vi' });
    for (const patch of [
      { locale: 'fr' },
      { defaultSpreadId: 'horseshoe' },
      { reduceMotion: 'maybe' },
      { includeReversed: 'yes' },
      { theme: 'night' },
      { somethingElse: true },
    ]) {
      expect(saveSettings(temp.db, patch).ok, JSON.stringify(patch)).toBe(false);
    }
    expect(getSettings(temp.db).locale).toBe('vi');
  });

  it('repairs a damaged row when it saves', () => {
    store('{broken');
    saveSettings(temp.db, { locale: 'vi' });
    expect(getSettings(temp.db)).toEqual({ ...DEFAULT_SETTINGS, locale: 'vi' });
  });
});
