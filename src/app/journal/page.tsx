import type { Metadata } from 'next';
import { connection } from 'next/server';
import { filterJournal, collectTags, type JournalType } from '@/application/journal/filters';
import { listJournalEntries } from '@/application/journal/journal';
import { ButtonLink } from '@/components/ui/Button/ButtonLink';
import { JournalFilters } from '@/features/journal/JournalFilters';
import { JournalList } from '@/features/journal/JournalList';
import styles from '@/features/journal/JournalPage.module.css';
import { t } from '@/i18n';
import { getDb } from '@/server/db/client';
import { loadSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'Journal' };

/** The most-used tags offered as chips; the one in use is always among them. */
const TAG_CHIPS = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { locale } = loadSettings();
  const params = await searchParams;
  const typeParam = one(params.type);
  const type: JournalType | undefined =
    typeParam === 'readings' || typeParam === 'reflections' ? typeParam : undefined;
  const tag = one(params.tag)?.trim() || undefined;

  const all = listJournalEntries(getDb());
  const items = filterJournal(all, { type, tag });
  const tags = collectTags(all);
  const chips = tags.slice(0, TAG_CHIPS);
  const active =
    tag && tags.find((entry) => entry.tag.toLocaleLowerCase() === tag.toLocaleLowerCase());
  if (active && !chips.includes(active)) chips.push(active);

  const subtitle =
    all.length === 0
      ? t(locale, 'journal.subtitleEmpty')
      : all.length === 1
        ? t(locale, 'journal.subtitleOne')
        : t(locale, 'journal.subtitle', { count: all.length });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.titles}>
          <h1 className={`ar-h1 ${styles.title}`}>{t(locale, 'journal.title')}</h1>
          <p className="ar-muted">{subtitle}</p>
        </div>
        <ButtonLink href="/journal/new" variant="primary" icon="plus">
          {t(locale, 'journal.new')}
        </ButtonLink>
      </header>
      {all.length > 0 ? <JournalFilters tags={chips} /> : null}
      <JournalList items={items} total={all.length} locale={locale} now={new Date()} />
    </div>
  );
}
