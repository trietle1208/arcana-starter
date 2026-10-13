'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, t, type Locale, type TranslationKey, type TranslationParams } from '.';

// The language is a saved setting. The root layout reads it from the database on every request and
// passes it in, so the server HTML is already in the reader's language on first paint. Changing
// it (Settings) is a Server Action that revalidates the layout, which brings a new `locale` here.

interface LocaleContextValue {
  locale: Locale;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE });

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/** `t` bound to the current locale. */
export function useT(): (key: TranslationKey, params?: TranslationParams) => string {
  const { locale } = useLocale();
  return useCallback((key, params) => t(locale, key, params), [locale]);
}
