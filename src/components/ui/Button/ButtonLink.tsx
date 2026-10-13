import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  variant?: 'primary' | 'secondary' | 'quiet';
  size?: 'md' | 'sm';
  icon?: IconName;
  iconAfter?: IconName;
}

/** A link that looks like a Button: for moving to another page, where a button would not be one. */
export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  iconAfter,
  children,
  prefetch = false,
  ...rest
}: ButtonLinkProps) {
  const classes = [styles.btn, styles[variant], size === 'sm' && styles.sm]
    .filter(Boolean)
    .join(' ');
  return (
    <Link {...rest} prefetch={prefetch} className={classes}>
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </Link>
  );
}
