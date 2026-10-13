import type { Metadata } from 'next';
import { connection } from 'next/server';
import { BackupPanel } from '@/features/settings/BackupPanel';
import { SettingsForm } from '@/features/settings/SettingsForm';
import styles from '@/features/settings/SettingsPage.module.css';
import { t } from '@/i18n';
import { loadSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'Settings' };

export default async function Page() {
  await connection();
  const settings = loadSettings();
  return (
    <div className={styles.page}>
      <h1 className={`ar-h1 ${styles.title}`}>{t(settings.locale, 'settings.title')}</h1>
      <SettingsForm
        settings={{
          locale: settings.locale,
          includeReversed: settings.includeReversed,
          revealOneByOne: settings.revealOneByOne,
          defaultSpreadId: settings.defaultSpreadId,
          interpretationDetail: settings.interpretationDetail,
          reduceMotion: settings.reduceMotion,
        }}
      />
      <BackupPanel />
    </div>
  );
}
