import type { Locale } from '@/domain/tarot/types';
import { en, type Dictionary, type TranslationKey } from './en';
import { vi } from './vi';

export type { Dictionary, Locale, TranslationKey };

export const LOCALES: readonly Locale[] = ['en', 'vi'];
export const DEFAULT_LOCALE: Locale = 'en';

const DICTIONARIES: Record<Locale, Dictionary> = { en, vi };

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'vi';
}

export type TranslationParams = Record<string, string | number>;

/** Looks up a UI string and fills in {placeholders}. */
export function t(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
  const text = DICTIONARIES[locale][key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
