'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Notice } from '@/components/ui/Notice/Notice';
import { useT } from '@/i18n/LocaleProvider';
import { importBackupAction, type ImportState } from './actions';
import styles from './SettingsForm.module.css';

const IDLE: ImportState = { status: 'idle' };

/** Export the journal as JSON, or read such a file back in. */
export function BackupPanel() {
  const t = useT();
  const [state, action, pending] = useActionState(importBackupAction, IDLE);

  return (
    <section className={styles.section} aria-labelledby="settings-data">
      <h2 id="settings-data" className={`ar-h2 ${styles.heading}`}>
        {t('settings.data.title')}
      </h2>
      <p className={`ar-muted ${styles.intro}`}>{t('settings.data.intro')}</p>

      {/* A plain GET: the route answers with a file download. */}
      <form action="/api/backup" method="get">
        <Button type="submit" variant="secondary">
          {t('settings.export')}
        </Button>
      </form>

      <form action={action} className={styles.import} aria-busy={pending}>
        <div className={styles.file}>
          <label htmlFor="backup-file" className={styles.choiceTitle}>
            {t('settings.import.label')}
          </label>
          <input id="backup-file" name="file" type="file" accept="application/json,.json" />
          <span className={styles.hint}>{t('settings.import.hint')}</span>
        </div>
        <div>
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? t('settings.import.importing') : t('settings.import.submit')}
          </Button>
        </div>
        {state.status === 'done' ? (
          <Notice tone="success" title={t('settings.import.done.title')}>
            {t('settings.import.done.body', { added: state.added, skipped: state.skipped })}
          </Notice>
        ) : null}
        {state.status === 'error' ? (
          <p role="alert" className={styles.error}>
            {t(
              state.reason === 'file'
                ? 'settings.import.error.file'
                : state.reason === 'size'
                  ? 'settings.import.error.size'
                  : state.reason === 'storage'
                    ? 'error.storage'
                    : 'settings.import.error.invalid',
            )}
          </p>
        ) : null}
      </form>
    </section>
  );
}
