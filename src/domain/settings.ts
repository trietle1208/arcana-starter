import type { UserSettings } from './records';

/** What a fresh install, a missing settings row or a damaged one starts from. */
export const DEFAULT_SETTINGS: Readonly<UserSettings> = {
  locale: 'en',
  theme: 'paper',
  includeReversed: true,
  revealOneByOne: true,
  defaultSpreadId: 'three-card',
  displayName: null,
  reduceMotion: 'system',
  interpretationDetail: 'brief',
};
