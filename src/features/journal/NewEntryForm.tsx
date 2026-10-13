'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { ButtonLink } from '@/components/ui/Button/ButtonLink';
import { splitTagInput } from '@/domain/journal';
import { useT } from '@/i18n/LocaleProvider';
import type { UiError } from '../actionResult';
import { createReflectionAction } from './actions';
import { EntryFields } from './EntryFields';
import styles from './NewEntryForm.module.css';

interface NewEntryFormProps {
  /** The card this reflection is about, when it was started from one. */
  card: { id: string; name: string } | null;
  /** The question the reader is answering, when it came with one. */
  prompt: string | null;
}

/** /journal/new: a reflection of the reader's own, with no cards drawn. */
export function NewEntryForm({ card, prompt }: NewEntryFormProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<UiError | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createReflectionAction({
        title: String(data.get('title') ?? ''),
        body: String(data.get('body') ?? ''),
        tags: splitTagInput(String(data.get('tags') ?? '')),
        prompt,
        cardId: card?.id ?? null,
      });
      if (result.ok) router.push(`/journal/${result.entryId}`);
      else setError(result.error);
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={`ar-h1 ${styles.title}`}>{t('newEntry.title')}</h1>
        <p className="ar-muted">
          {card ? t('newEntry.about', { card: card.name }) : t('newEntry.intro')}
        </p>
        {prompt ? <p className={styles.prompt}>{prompt}</p> : null}
      </header>
      <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
        <EntryFields
          idPrefix="new-entry"
          defaults={{ title: card?.name ?? '', body: '', tags: '' }}
          error={error}
          autoFocusTitle
        />
        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? t('save.saving') : t('newEntry.submit')}
          </Button>
          <ButtonLink href="/journal" variant="quiet">
            {t('newEntry.cancel')}
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
