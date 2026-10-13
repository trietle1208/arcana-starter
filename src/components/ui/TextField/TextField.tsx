import { useId, type InputHTMLAttributes } from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>,
  'className'
> {
  /** Always visible, above the field; never use the placeholder as the label. */
  label: string;
  /** Guidance below the field. Phrase errors as what to do, not what went wrong. */
  hint?: string;
  /** A ruled notebook textarea instead of a single-line input. */
  multiline?: boolean;
  rows?: number;
  className?: string;
}

/** A labelled input; `multiline` makes it the journal's ruled notebook textarea. */
export function TextField({
  label,
  hint,
  multiline,
  rows,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const shared = {
    id: fieldId,
    className: styles.input,
    'aria-describedby': hint ? hintId : undefined,
    ...rest,
  };
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      {multiline ? <textarea rows={rows ?? 5} {...shared} /> : <input {...shared} />}
      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
