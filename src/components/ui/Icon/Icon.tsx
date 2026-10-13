import styles from './Icon.module.css';

export type IconName =
  | 'home'
  | 'library'
  | 'reading'
  | 'study'
  | 'journal'
  | 'settings'
  | 'search'
  | 'plus'
  | 'check'
  | 'arrow'
  | 'shuffle'
  | 'bookmark'
  | 'pen'
  | 'turn'
  | 'info'
  | 'x';

export interface IconProps {
  name: IconName;
  size?: number;
  /** An icon on its own needs a label; beside text it stays decorative. */
  label?: string;
  className?: string;
}

const PATHS: Record<IconName, string> = {
  home: 'M3.5 10.5 12 4l8.5 6.5M6 9v10.5h4.5V15h3v4.5H18V9',
  library: 'M5 4.5h4v15H5zM10.5 4.5h4v15h-4zM16 5.2l3.4-.9 3.1 14.6-3.4.8z',
  reading: 'M4 6.5h5v11H4zM9.5 5h5v14h-5zM15 6.5h5v11h-5z',
  study: 'M3 8.5 12 4.5l9 4-9 4-9-4zM7 10.5v4.2c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-4.2M21 8.5v5',
  journal:
    'M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6zM6 3.5v17M9.5 8h5.5M9.5 11.5h5.5',
  settings:
    'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6',
  search: 'M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM15 15l5 5',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.2 4L19 7',
  arrow: 'M5 12h14M13.5 6.5 19 12l-5.5 5.5',
  shuffle:
    'M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.6 0 2.7-1.6 3.6-3.5M14 10c.8-1.6 1.6-3 3-3H20M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5',
  bookmark: 'M7 4h10v16l-5-3.5L7 20z',
  pen: 'M15.5 4.5l4 4L9 19H5v-4zM13.5 6.5l4 4',
  turn: 'M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4',
  info: 'M12 3.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4zM12 11v5M12 7.8v.4',
  x: 'M6 6l12 12M18 6 6 18',
};

const SEGMENTS = Object.fromEntries(
  Object.entries(PATHS).map(([name, d]) => [
    name,
    d
      .split('M')
      .filter(Boolean)
      .map((s) => `M${s}`),
  ]),
) as Record<IconName, string[]>;

export function Icon({ name, size = 20, label, className }: IconProps) {
  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {SEGMENTS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
