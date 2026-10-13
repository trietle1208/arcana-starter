import type { IconName } from '@/components/ui/Icon/Icon';
import type { NavItem } from '@/components/ui/AppNav/AppNav';
import type { TranslationKey } from '@/i18n';

export interface NavDef {
  id: string;
  icon: IconName;
  href: string;
  label: TranslationKey;
  /** One-word label used by the bottom bar. */
  shortLabel?: TranslationKey;
}

export const NAV_ITEMS: readonly NavDef[] = [
  { id: 'home', icon: 'home', href: '/', label: 'nav.home', shortLabel: 'nav.short.home' },
  {
    id: 'library',
    icon: 'library',
    href: '/library',
    label: 'nav.library',
    shortLabel: 'nav.short.library',
  },
  {
    id: 'reading',
    icon: 'reading',
    href: '/reading',
    label: 'nav.reading',
    shortLabel: 'nav.short.reading',
  },
  { id: 'study', icon: 'study', href: '/study', label: 'nav.study', shortLabel: 'nav.short.study' },
  {
    id: 'journal',
    icon: 'journal',
    href: '/journal',
    label: 'nav.journal',
    shortLabel: 'nav.short.journal',
  },
  { id: 'settings', icon: 'settings', href: '/settings', label: 'nav.settings' },
];

/** Settings lives in the mobile top bar, so the bottom bar shows five items. */
export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.id !== 'settings');

/** The destinations with their labels translated for AppNav. */
export function toNavItems(defs: readonly NavDef[], t: (key: TranslationKey) => string): NavItem[] {
  return defs.map((def) => ({
    id: def.id,
    icon: def.icon,
    href: def.href,
    label: t(def.label),
    shortLabel: def.shortLabel ? t(def.shortLabel) : undefined,
  }));
}

export function activeNavId(pathname: string): string | undefined {
  if (pathname === '/') return 'home';
  return NAV_ITEMS.find(
    (item) => item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  )?.id;
}
