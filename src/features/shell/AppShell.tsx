import type { ReactNode } from 'react';
import { MobileBar } from './MobileBar';
import { SiteNav } from './SiteNav';
import styles from './AppShell.module.css';

/** Side nav on desktop; top bar + bottom nav under 768px. Both navs render, CSS shows one. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <SiteNav orientation="side" className={styles.sideNav} />
      <div className={styles.column}>
        <MobileBar />
        <main className={styles.main}>{children}</main>
        <SiteNav orientation="bottom" className={styles.bottomNav} />
      </div>
    </div>
  );
}
