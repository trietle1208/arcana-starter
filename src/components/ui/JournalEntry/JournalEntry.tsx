import Image from 'next/image';
import Link from 'next/link';
import { Tag } from '../Tag/Tag';
import styles from './JournalEntry.module.css';

export interface JournalEntryProps {
  /** The day of the month, already formatted: "12". */
  day: string;
  /** The short month, already formatted: "Oct". */
  month: string;
  /** The spread name, or whatever kind of entry this is: "Three cards · Past, present, future". */
  spread: string;
  title: string;
  /** Clamped to two lines. */
  excerpt?: string;
  tags?: string[];
  /** Image URLs of the cards drawn; hidden under 560px. */
  cards?: string[];
  href: string;
}

/** One saved reading in the Journal list, styled as a notebook page. */
export function JournalEntry({
  day,
  month,
  spread,
  title,
  excerpt,
  tags,
  cards,
  href,
}: JournalEntryProps) {
  return (
    <Link href={href} className={styles.entry} prefetch={false}>
      <div className={styles.date}>
        <b>{day}</b>
        <span>{month}</span>
      </div>
      <div className={styles.body}>
        <span className="ar-overline">{spread}</span>
        <span className={styles.title}>{title}</span>
        {excerpt ? <span className={styles.text}>{excerpt}</span> : null}
        {tags && tags.length > 0 ? (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <Tag key={tag} tone="rose">
                {tag}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>
      {cards && cards.length > 0 ? (
        <div className={styles.cards} aria-hidden="true">
          {cards.map((src, i) => (
            <Image key={`${src}-${i}`} src={src} alt="" width={30} height={54} sizes="30px" />
          ))}
        </div>
      ) : null}
    </Link>
  );
}
