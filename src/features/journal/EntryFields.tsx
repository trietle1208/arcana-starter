'use client';

import { TextField } from '@/components/ui/TextField/TextField';
import { useT } from '@/i18n/LocaleProvider';
import { UI_ERROR_KEY, type UiError } from '../actionResult';
import styles from './EntryFields.module.css';

export interface EntryDefaults {
  title: string;
  body: string;
  /** The tags as the reader types them: "Work, Calm". */
  tags: string;
}

interface EntryFieldsProps {
  defaults: EntryDefaults;
  error: UiError | null;
  autoFocusTitle?: boolean;
  /** Distinguishes the fields of two forms on one page. */
  idPrefix: string;
}

/** Title, notes and tags: the three things a journal entry has, in every form that writes one. */
export function EntryFields({ defaults, error, autoFocusTitle, idPrefix }: EntryFieldsProps) {
  const t = useT();
  return (
    <div className={styles.fields}>
      <TextField
        id={`${idPrefix}-field-title`}
        name="title"
        label={t('field.title')}
        defaultValue={defaults.title}
        maxLength={140}
        autoFocus={autoFocusTitle}
        autoComplete="off"
        error={error === 'title' ? t(UI_ERROR_KEY.title) : undefined}
      />
      <TextField
        id={`${idPrefix}-field-body`}
        name="body"
        multiline
        rows={5}
        label={t('field.body')}
        placeholder={t('field.body.placeholder')}
        defaultValue={defaults.body}
        maxLength={20000}
      />
      <TextField
        id={`${idPrefix}-field-tags`}
        name="tags"
        label={t('field.tags')}
        hint={t('field.tags.hint')}
        defaultValue={defaults.tags}
        autoComplete="off"
        error={error === 'tags' ? t(UI_ERROR_KEY.tags) : undefined}
      />
      {error && error !== 'title' && error !== 'tags' ? (
        <p role="alert" className={styles.error}>
          {t(UI_ERROR_KEY[error])}
        </p>
      ) : null}
    </div>
  );
}
