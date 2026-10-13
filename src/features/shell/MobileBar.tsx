'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon/Icon';
import { Wordmark } from '@/components/ui/AppNav/Wordmark';
import { useT } from '@/i18n/LocaleProvider';
import { activeNavId } from './navItems';
import styles from './AppShell.module.css';

/** Top bar under 768px: the wordmark and a way to reach Settings. */
export function MobileBar() {
  const onSettings = activeNavId(usePathname()) === 'settings';
  const t = useT();
  return (
    <header className={styles.mobileBar}>
      <Wordmark className={styles.mobileBrand} />
      <div className={styles.mobileActions}>
        <Link
          href="/settings"
          className={styles.gear}
          aria-label={t('nav.settings')}
          aria-current={onSettings ? 'page' : undefined}
          prefetch={false}
        >
          <Icon name="settings" />
        </Link>
      </div>
    </header>
  );
}
