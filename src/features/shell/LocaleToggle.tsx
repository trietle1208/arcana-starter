'use client';

import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { isLocale } from '@/i18n';
import { useLocale, useT } from '@/i18n/LocaleProvider';

const OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
];

/** Temporary dev toggle for the UI language. Phase 3 replaces it with the Settings page. */
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const t = useT();
  return (
    <SegmentedControl
      label={t('locale.label')}
      options={OPTIONS}
      value={locale}
      onChange={(value) => {
        if (isLocale(value)) setLocale(value);
      }}
    />
  );
}
