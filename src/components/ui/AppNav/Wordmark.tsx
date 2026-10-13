import styles from './AppNav.module.css';

/** "Arcana" in Fraunces italic with a terracotta full stop. There is no logo file. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={[styles.brand, className].filter(Boolean).join(' ')}>
      Arcana<span>.</span>
    </span>
  );
}
