import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'gold' | 'night';
  size?: 'md' | 'sm';
  icon?: IconName;
  iconAfter?: IconName;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconAfter,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles.btn, styles[variant], size === 'sm' && styles.sm, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} {...rest} className={classes}>
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size={18} /> : null}
    </button>
  );
}
