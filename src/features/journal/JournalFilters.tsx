'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tag } from '@/components/ui/Tag/Tag';
import { useT } from '@/i18n/LocaleProvider';
import styles from './JournalList.module.css';

interface JournalFiltersProps {
  tags: { tag: string; count: number }[];
}

type TypeFilter = 'readings' | 'reflections';

/** Filter chips for the journal list. They live in the URL (?type=&tag=), like the library's. */
export function JournalFilters({ tags }: JournalFiltersProps) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const type = params.get('type');
  const tag = params.get('tag');

  function go(next: { type?: TypeFilter | null; tag?: string | null }) {
    const query = new URLSearchParams();
    const nextType = next.type === undefined ? type : next.type;
    const nextTag = next.tag === undefined ? tag : next.tag;
    if (nextType) query.set('type', nextType);
    if (nextTag) query.set('tag', nextTag);
    const text = query.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  }

  const typeChip = (value: TypeFilter | null, label: string) => (
    <Tag
      key={label}
      selected={type === value || (value === null && type === null)}
      onClick={() => go({ type: value })}
    >
      {label}
    </Tag>
  );

  return (
    <div className={styles.filters}>
      <div
        className="ar-row"
        role="group"
        aria-label={t('journal.filter.label')}
        style={{ gap: 8 }}
      >
        {typeChip(null, t('journal.filter.all'))}
        {typeChip('readings', t('journal.filter.readings'))}
        {typeChip('reflections', t('journal.filter.reflections'))}
      </div>
      {tags.length > 0 ? (
        <div
          className="ar-row"
          role="group"
          aria-label={t('journal.filter.tags')}
          style={{ gap: 8 }}
        >
          {tags.map(({ tag: name }) => (
            <Tag
              key={name}
              tone="rose"
              selected={tag?.toLocaleLowerCase() === name.toLocaleLowerCase()}
              onClick={() =>
                go({ tag: tag?.toLocaleLowerCase() === name.toLocaleLowerCase() ? null : name })
              }
            >
              {name}
            </Tag>
          ))}
        </div>
      ) : null}
    </div>
  );
}
