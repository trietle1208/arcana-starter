import Link from 'next/link';
import { Icon, type IconName } from '../Icon/Icon';
import { Wordmark } from './Wordmark';
import styles from './AppNav.module.css';

export interface NavItem {
  id: string;
  label: string;
  icon?: IconName;
  href: string;
  /** One-word label used by the bottom bar. */
  shortLabel?: string;
}

export interface AppNavProps {
  /** Id of the active item; sets aria-current="page". */
  active?: string;
  items: NavItem[];
  orientation?: 'side' | 'bottom';
  /** Accessible name of the landmark. */
  label?: string;
  className?: string;
}

export function AppNav({
  active,
  items,
  orientation = 'side',
  label = 'Main',
  className,
}: AppNavProps) {
  const bottom = orientation === 'bottom';
  const classes = [styles.nav, bottom && styles.bottom, className].filter(Boolean).join(' ');
  return (
    <nav className={classes} aria-label={label}>
      {bottom ? null : <Wordmark />}
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={item.id === active ? 'page' : undefined}
          prefetch={false}
        >
          <Icon name={item.icon ?? (item.id as IconName)} />
          <span>{bottom && item.shortLabel ? item.shortLabel : item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
