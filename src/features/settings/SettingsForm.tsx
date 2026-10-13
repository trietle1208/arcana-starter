'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { Switch } from '@/components/ui/Switch/Switch';
import { SPREADS } from '@/content/spreads';
import type { UserSettings } from '@/domain/records';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { saveSettingsAction } from './actions';
import styles from './SettingsForm.module.css';

type Editable = Pick<
  UserSettings,
  | 'locale'
  | 'includeReversed'
  | 'revealOneByOne'
  | 'defaultSpreadId'
  | 'interpretationDetail'
  | 'reduceMotion'
>;

/** A setting that is a choice of a few: its name and what it does, then the control. */
function Choice({
  title,
  description,
  children,
}: {
  /** Left out when the section's own heading already says it. */
  title?: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.choice}>
      <div className={styles.choiceText}>
        {title ? <span className={styles.choiceTitle}>{title}</span> : null}
        <span className={styles.hint}>{description}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * Every setting applies the moment it changes (no Save button): the choice is shown at once, sent
 * to the server, and the layout re-renders in the new language or motion mode.
 */
export function SettingsForm({ settings }: { settings: Editable }) {
  const t = useT();
  const { locale } = useLocale();
  const [values, setValues] = useState<Editable>(settings);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  function change(patch: Partial<Editable>) {
    const previous = values;
    setValues({ ...values, ...patch });
    setFailed(false);
    startTransition(async () => {
      const result = await saveSettingsAction(patch);
      if (!result.ok) {
        setValues(previous);
        setFailed(true);
      }
    });
  }

  return (
    <div className={styles.form}>
      <section className={styles.section} aria-labelledby="settings-language">
        <h2 id="settings-language" className={`ar-h2 ${styles.heading}`}>
          {t('settings.language.title')}
        </h2>
        <Choice description={t('settings.language.description')}>
          <SegmentedControl
            label={t('locale.label')}
            options={[
              { value: 'en', label: 'English' },
              { value: 'vi', label: 'Tiếng Việt' },
            ]}
            value={values.locale}
            onChange={(value) => change({ locale: value as Editable['locale'] })}
          />
        </Choice>
      </section>

      <section className={styles.section} aria-labelledby="settings-readings">
        <h2 id="settings-readings" className={`ar-h2 ${styles.heading}`}>
          {t('settings.readings.title')}
        </h2>
        <div>
          <Switch
            label={t('settings.reversed.label')}
            description={t('settings.reversed.description')}
            checked={values.includeReversed}
            onChange={(checked) => change({ includeReversed: checked })}
          />
          <Switch
            label={t('settings.reveal.label')}
            description={t('settings.reveal.description')}
            checked={values.revealOneByOne}
            onChange={(checked) => change({ revealOneByOne: checked })}
          />
        </div>
        <Choice title={t('settings.spread.label')} description={t('settings.spread.description')}>
          <SegmentedControl
            label={t('settings.spread.label')}
            options={SPREADS.map((spread) => ({ value: spread.id, label: spread.name[locale] }))}
            value={values.defaultSpreadId}
            onChange={(value) => change({ defaultSpreadId: value })}
          />
        </Choice>
        <Choice title={t('settings.detail.label')} description={t('settings.detail.description')}>
          <SegmentedControl
            label={t('settings.detail.label')}
            options={[
              { value: 'brief', label: t('settings.detail.brief') },
              { value: 'full', label: t('settings.detail.full') },
            ]}
            value={values.interpretationDetail}
            onChange={(value) =>
              change({ interpretationDetail: value as Editable['interpretationDetail'] })
            }
          />
        </Choice>
      </section>

      <section className={styles.section} aria-labelledby="settings-motion">
        <h2 id="settings-motion" className={`ar-h2 ${styles.heading}`}>
          {t('settings.motion.title')}
        </h2>
        <Choice title={t('settings.motion.label')} description={t('settings.motion.description')}>
          <SegmentedControl
            label={t('settings.motion.label')}
            options={[
              { value: 'system', label: t('settings.motion.system') },
              { value: 'on', label: t('settings.motion.on') },
              { value: 'off', label: t('settings.motion.off') },
            ]}
            value={values.reduceMotion}
            onChange={(value) => change({ reduceMotion: value as Editable['reduceMotion'] })}
          />
        </Choice>
      </section>

      <p role="alert" className={styles.error}>
        {failed ? t('settings.saveError') : ''}
      </p>
    </div>
  );
}
