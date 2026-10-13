'use client';

import { useT } from '@/i18n/LocaleProvider';
import styles from './CardBrowser.module.css';

/** Page title and subtitle; shared by the browser and its loading fallback. */
export function LibraryTitles({ total }: { total: number }) {
  const t = useT();
  return (
    <div className={styles.titles}>
      <h1 className={`ar-h1 ${styles.title}`}>{t('library.title')}</h1>
      <p className={`ar-muted ${styles.subtitle}`}>{t('library.subtitle', { total })}</p>
    </div>
  );
}

export function LibraryFallback({ total }: { total: number }) {
  const t = useT();
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <LibraryTitles total={total} />
      </header>
      <p className="ar-hint" role="status">
        {t('library.loading')}
      </p>
    </div>
  );
}
