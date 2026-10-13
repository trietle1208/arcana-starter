'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  /** Controlled value; with `defaultValue` the control keeps its own state. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible name of the group. */
  label: string;
  className?: string;
}

/**
 * One choice among two to four peers that change what is shown. A radiogroup: arrow keys move
 * the selection, and only the selected segment is in the tab order.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  label,
  className,
}: SegmentedControlProps) {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value);
  const current = value !== undefined ? value : inner;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function pick(next: string) {
    setInner(next);
    onChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const target = (index + step + options.length) % options.length;
    pick(options[target].value);
    buttons.current[target]?.focus();
  }

  return (
    <div
      className={[styles.seg, className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((option, i) => {
        const checked = option.value === current;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => pick(option.value)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
