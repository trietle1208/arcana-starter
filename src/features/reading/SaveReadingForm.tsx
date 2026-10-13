'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { splitTagInput } from '@/domain/journal';
import type { Reading } from '@/domain/records';
import { useT } from '@/i18n/LocaleProvider';
import type { UiError } from '../actionResult';
import { EntryFields } from '../journal/EntryFields';
import { saveReadingAction } from './actions';
import styles from './SaveReadingForm.module.css';

interface SaveReadingFormProps {
  reading: Reading;
  /** The first card's name: what the entry is called unless the reader says otherwise. */
  defaultTitle: string;
  onSaved: (entryId: string) => void;
  onCancel: () => void;
}

/** Below the table once a reading is done: a title, notes and tags, then it goes to the journal. */
export function SaveReadingForm({
  reading,
  defaultTitle,
  onSaved,
  onCancel,
}: SaveReadingFormProps) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<UiError | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = {
      reading,
      title: String(data.get('title') ?? ''),
      body: String(data.get('body') ?? ''),
      tags: splitTagInput(String(data.get('tags') ?? '')),
    };
    setError(null);
    startTransition(async () => {
      const result = await saveReadingAction(input);
      if (result.ok) onSaved(result.entryId);
      else setError(result.error);
    });
  }

  return (
    <section className={styles.panel} aria-labelledby="save-reading-title">
      <header className={styles.head}>
        <h2 id="save-reading-title" className={`ar-h2 ${styles.title}`}>
          {t('save.title')}
        </h2>
        <p className={`ar-muted ${styles.intro}`}>{t('save.intro')}</p>
      </header>
      <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
        <EntryFields
          idPrefix="save-reading"
          defaults={{ title: defaultTitle, body: '', tags: '' }}
          error={error}
          autoFocusTitle
        />
        <div className={styles.actions}>
          <Button type="submit" variant="primary" icon="bookmark" disabled={pending}>
            {pending ? t('save.saving') : t('save.submit')}
          </Button>
          <Button type="button" variant="quiet" onClick={onCancel} disabled={pending}>
            {t('save.cancel')}
          </Button>
        </div>
      </form>
    </section>
  );
}
