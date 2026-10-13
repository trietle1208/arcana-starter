'use client';

import { usePathname } from 'next/navigation';
import { AppNav } from '@/components/ui/AppNav/AppNav';
import { activeNavId, BOTTOM_NAV_ITEMS, NAV_ITEMS } from './navItems';

/** Wires AppNav to the current route. The shell shows the side or the bottom variant with CSS. */
export function SiteNav({
  orientation,
  className,
}: {
  orientation: 'side' | 'bottom';
  className?: string;
}) {
  const active = activeNavId(usePathname());
  return (
    <AppNav
      active={active}
      items={orientation === 'bottom' ? BOTTOM_NAV_ITEMS : NAV_ITEMS}
      orientation={orientation}
      className={className}
    />
  );
}
