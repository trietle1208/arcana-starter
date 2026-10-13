import type { NavItem } from '@/components/ui/AppNav/AppNav';

// English labels until the i18n dictionaries arrive in Phase 1.
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', href: '/', shortLabel: 'Home' },
  {
    id: 'library',
    label: 'Card library',
    icon: 'library',
    href: '/library',
    shortLabel: 'Library',
  },
  {
    id: 'reading',
    label: 'Reading room',
    icon: 'reading',
    href: '/reading',
    shortLabel: 'Read',
  },
  { id: 'study', label: 'Study', icon: 'study', href: '/study', shortLabel: 'Study' },
  { id: 'journal', label: 'Journal', icon: 'journal', href: '/journal', shortLabel: 'Journal' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

/** Settings lives in the mobile top bar, so the bottom bar shows five items. */
export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.id !== 'settings');

export function activeNavId(pathname: string): string | undefined {
  if (pathname === '/') return 'home';
  return NAV_ITEMS.find(
    (item) => item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  )?.id;
}
