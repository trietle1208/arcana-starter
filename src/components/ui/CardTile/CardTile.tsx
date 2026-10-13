import Link from 'next/link';
import { Tag } from '../Tag/Tag';
import { TarotCard, type TarotCardLabels } from '../TarotCard/TarotCard';
import styles from './CardTile.module.css';

export interface CardTileProps {
  src?: string;
  name: string;
  /** One quiet line above the name: "Major · IX", "Cups · Three". */
  meta?: string;
  numeral?: string;
  /** At most two are shown. */
  keywords?: string[];
  href: string;
  sizes?: string;
  priority?: boolean;
  labels?: Partial<TarotCardLabels>;
}

/** One card in the library grid: art, a meta line, the name and up to two keyword tags. */
export function CardTile({
  src,
  name,
  meta,
  numeral,
  keywords,
  href,
  sizes,
  priority,
  labels,
}: CardTileProps) {
  const shown = keywords?.slice(0, 2) ?? [];
  return (
    <Link href={href} className={styles.tile} prefetch={false}>
      <TarotCard
        src={src}
        name={name}
        numeral={numeral}
        className={styles.card}
        sizes={sizes}
        priority={priority}
        labels={labels}
      />
      <span className={styles.text}>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
        <span className={styles.name}>{name}</span>
        {shown.length > 0 ? (
          <span className={styles.keys}>
            {shown.map((keyword) => (
              <Tag key={keyword}>{keyword}</Tag>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
