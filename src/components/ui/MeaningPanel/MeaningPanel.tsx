import { Icon } from '../Icon/Icon';
import { Tag } from '../Tag/Tag';
import styles from './MeaningPanel.module.css';

export interface MeaningPanelLabels {
  upright: string;
  reversed: string;
  symbolism: string;
}

const DEFAULT_LABELS: MeaningPanelLabels = {
  upright: 'Upright',
  reversed: 'Reversed',
  symbolism: 'Symbolism',
};

export interface MeaningPanelProps {
  upright: string;
  reversed?: string;
  symbolism?: string;
  keywords?: string[];
  labels?: Partial<MeaningPanelLabels>;
  /** Heading level of the sections; 3 under an h2, 2 directly under the page's h1. */
  headingLevel?: 2 | 3;
  /** Texts that equal this string are shown as a quiet note instead (cards still being written). */
  pendingText?: string;
  isPending?: (text: string) => boolean;
}

/** The reference-book block on Card Detail: keywords, then Upright, Reversed and Symbolism. */
export function MeaningPanel({
  upright,
  reversed,
  symbolism,
  keywords,
  labels: labelOverrides,
  headingLevel = 3,
  pendingText,
  isPending,
}: MeaningPanelProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const Heading = `h${headingLevel}` as const;
  const body = (text: string) =>
    isPending?.(text) ? (
      <p className={`${styles.text} ${styles.pending}`}>{pendingText}</p>
    ) : (
      <p className={styles.text}>{text}</p>
    );
  return (
    <div className={styles.meaning}>
      {keywords && keywords.length > 0 ? (
        <div className={styles.keys}>
          {keywords.map((keyword) => (
            <Tag key={keyword}>{keyword}</Tag>
          ))}
        </div>
      ) : null}
      <section className={styles.section}>
        <Heading className={styles.heading}>
          <Icon name="arrow" size={18} />
          {labels.upright}
        </Heading>
        {body(upright)}
      </section>
      {reversed ? (
        <section className={`${styles.section} ${styles.reversed}`}>
          <Heading className={styles.heading}>
            <Icon name="arrow" size={18} />
            {labels.reversed}
          </Heading>
          {body(reversed)}
        </section>
      ) : null}
      {symbolism ? (
        <section className={styles.section}>
          <Heading className={styles.heading}>{labels.symbolism}</Heading>
          {body(symbolism)}
        </section>
      ) : null}
    </div>
  );
}
