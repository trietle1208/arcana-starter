import { z } from 'zod';
import { hasSpread } from '@/content/spreads';
import type { UserSettings } from '@/domain/records';
import { DEFAULT_SETTINGS } from '@/domain/settings';

// One definition per setting. Reading what is stored is forgiving (`UserSettingsSchema`: a missing
// or damaged field falls back to its own default, so the layout never crashes); writing is strict
// (`SettingsPatchSchema`: a bad value is rejected).
const fields = {
  locale: z.enum(['en', 'vi']),
  theme: z.literal('paper'),
  includeReversed: z.boolean(),
  revealOneByOne: z.boolean(),
  defaultSpreadId: z.string().refine(hasSpread),
  displayName: z.string().trim().min(1).max(60).nullable(),
  reduceMotion: z.enum(['system', 'on', 'off']),
  interpretationDetail: z.enum(['brief', 'full']),
};

const D = DEFAULT_SETTINGS;

export const UserSettingsSchema = z.object({
  locale: fields.locale.catch(D.locale),
  theme: fields.theme.catch(D.theme),
  includeReversed: fields.includeReversed.catch(D.includeReversed),
  revealOneByOne: fields.revealOneByOne.catch(D.revealOneByOne),
  defaultSpreadId: fields.defaultSpreadId.catch(D.defaultSpreadId),
  displayName: fields.displayName.catch(D.displayName),
  reduceMotion: fields.reduceMotion.catch(D.reduceMotion),
  interpretationDetail: fields.interpretationDetail.catch(D.interpretationDetail),
});

/** Any subset of the settings; the server merges it into what is stored. */
export const SettingsPatchSchema = z.object(fields).partial().strict();
export type SettingsPatch = z.infer<typeof SettingsPatchSchema>;

// The schema and the domain type must not drift: each side has to be assignable to the other.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _settings: Equal<z.infer<typeof UserSettingsSchema>, UserSettings> = true;
void _settings;
