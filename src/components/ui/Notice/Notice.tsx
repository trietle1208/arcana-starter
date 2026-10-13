import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Notice.module.css';

export interface NoticeProps {
  /** Says what happened, in the past tense. */
  title?: string;
  /** Says what is next. */
  children?: ReactNode;
  tone?: 'success' | 'info';
  /** One optional quiet action ("Open", "Undo"). */
  action?: ReactNode;
}

/** Inline feedback after a draw or a save. A status region: it is announced, never modal. */
export function Notice({ title, children, tone = 'success', action }: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role="status">
      <Icon name={tone === 'success' ? 'check' : 'info'} />
      <div className={styles.body}>
        {title ? <span className={styles.title}>{title}</span> : null}
        {children ? <span>{children}</span> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
