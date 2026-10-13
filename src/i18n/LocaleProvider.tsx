'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  isLocale,
  t,
  type Locale,
  type TranslationKey,
  type TranslationParams,
} from '.';

// Phase 1 only: the language is a temporary dev toggle kept in localStorage, so the server never
// reads it and every page stays statically generated. The server HTML is always English; the
// client switches after hydration. Phase 3 replaces this with the saved setting, read in the root
// layout and passed in as the initial value.
const STORAGE_KEY = 'arcana.locale';

let override: Locale | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getSnapshot(): Locale {
  if (override) return override;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage can be blocked; the default is fine.
  }
  return DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    override = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still holds for this page view.
    }
    listeners.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
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
