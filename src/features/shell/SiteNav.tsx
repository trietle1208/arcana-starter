'use client';

import { usePathname } from 'next/navigation';
import { AppNav } from '@/components/ui/AppNav/AppNav';
import { useT } from '@/i18n/LocaleProvider';
import { LocaleToggle } from './LocaleToggle';
import { activeNavId, BOTTOM_NAV_ITEMS, NAV_ITEMS, toNavItems } from './navItems';

/** Wires AppNav to the current route. The shell shows the side or the bottom variant with CSS. */
export function SiteNav({
  orientation,
  className,
}: {
  orientation: 'side' | 'bottom';
  className?: string;
}) {
  const active = activeNavId(usePathname());
  const t = useT();
  const bottom = orientation === 'bottom';
  return (
    <AppNav
      active={active}
      items={toNavItems(bottom ? BOTTOM_NAV_ITEMS : NAV_ITEMS, t)}
      orientation={orientation}
      label={t('nav.label')}
      className={className}
      footer={bottom ? undefined : <LocaleToggle />}
    />
  );
}
