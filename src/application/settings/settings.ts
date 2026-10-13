import type { UserSettings } from '@/domain/records';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import type { Db } from '@/server/db/client';
import { readSettingsJson, writeSettingsJson } from '@/server/repositories/settings';
import { resolveDeps, type Deps } from '../deps';
import { fail, ok, type Result } from '../result';
import { SettingsPatchSchema, UserSettingsSchema } from './schema';

/** Turns stored text into settings. Never throws: damage falls back to defaults. */
export function parseSettings(json: string | null): UserSettings {
  if (json === null) return { ...DEFAULT_SETTINGS };
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch (error) {
    console.error('Stored settings are not valid JSON; using the defaults.', error);
    return { ...DEFAULT_SETTINGS };
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    console.error('Stored settings are not an object; using the defaults.');
    return { ...DEFAULT_SETTINGS };
  }
  return UserSettingsSchema.parse(value);
}

/**
 * The reader's settings. The root layout calls this on every request, so a missing row, damaged
 * JSON or a bad value must never throw: the app opens with defaults instead.
 */
export function getSettings(db: Db): UserSettings {
  let json: string | null;
  try {
    json = readSettingsJson(db);
  } catch (error) {
    console.error('Could not read the settings; using the defaults.', error);
    return { ...DEFAULT_SETTINGS };
  }
  return parseSettings(json);
}

/** Merges a partial change into the stored settings and saves the whole. */
export function saveSettings(
  db: Db,
  patch: unknown,
  deps: Partial<Deps> = {},
): Result<UserSettings> {
  const parsed = SettingsPatchSchema.safeParse(patch);
  if (!parsed.success) return fail('invalid-input', String(parsed.error.issues[0]?.path[0] ?? ''));
  const merged = db.transaction((tx) => {
    const next: UserSettings = { ...parseSettings(readSettingsJson(tx)), ...parsed.data };
    writeSettingsJson(tx, JSON.stringify(next), resolveDeps(deps).now());
    return next;
  });
  return ok(merged);
}
