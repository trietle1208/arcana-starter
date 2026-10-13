'use client';

import { useId, useState } from 'react';
import styles from './Switch.module.css';

export interface SwitchProps {
  /** States the setting, not the action: "Include reversed cards". */
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/** A settings row: label, one-line description, and a switch that applies at once. */
export function Switch({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
}: SwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  const [inner, setInner] = useState(!!defaultChecked);
  const on = checked !== undefined ? checked : inner;

  function toggle() {
    setInner(!on);
    onChange?.(!on);
  }

  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span className={styles.label} id={labelId}>
          {label}
        </span>
        {description ? (
          <span className={styles.hint} id={descriptionId}>
            {description}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        className={styles.switch}
        onClick={toggle}
      />
    </div>
  );
}
