'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon/Icon';
import { Wordmark } from '@/components/ui/AppNav/Wordmark';
import { activeNavId } from './navItems';
import styles from './AppShell.module.css';

/** Top bar under 768px: the wordmark and a way to reach Settings. */
export function MobileBar() {
  const onSettings = activeNavId(usePathname()) === 'settings';
  return (
    <header className={styles.mobileBar}>
      <Wordmark className={styles.mobileBrand} />
      <Link
        href="/settings"
        className={styles.gear}
        aria-label="Settings"
        aria-current={onSettings ? 'page' : undefined}
        prefetch={false}
      >
        <Icon name="settings" />
      </Link>
    </header>
  );
}
