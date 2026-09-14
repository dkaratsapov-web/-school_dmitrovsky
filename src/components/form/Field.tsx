'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Icon } from '../ui/Icon';
import s from './form.module.css';

type Base = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

function Wrapper({
  label,
  hint,
  error,
  required,
  controlId,
  hintId,
  errorId,
  children,
}: Base & { controlId: string; hintId: string; errorId: string; children: ReactNode }) {
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={controlId}>
        {label}
        {required ? (
          <>
            {' '}
            <span className={s.required} aria-hidden="true">
              *
            </span>
            <span className="visually-hidden">обязательное поле</span>
          </>
        ) : null}
      </label>
      {children}
      {hint ? (
        <span className={s.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className={s.error} id={errorId} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </span>
      ) : null}
    </div>
  );
}

function describedBy(hint: string | undefined, error: string | undefined, hintId: string, errorId: string) {
  const ids = [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ');
  return ids === '' ? undefined : ids;
}

type InputProps = Base & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>;

export function Input({ label, hint, error, required, ...rest }: InputProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={id}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        id={id}
        className={s.control}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errorId)}
        {...rest}
      />
    </Wrapper>
  );
}

type TextareaProps = Base & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>;

export function Textarea({ label, hint, error, required, ...rest }: TextareaProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={id}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        id={id}
        className={s.control}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errorId)}
        {...rest}
      />
    </Wrapper>
  );
}

type SelectProps = Base &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    options: readonly { value: string; label: string }[];
    placeholder?: string;
  };

export function Select({ label, hint, error, required, options, placeholder, ...rest }: SelectProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={id}
      hintId={hintId}
      errorId={errorId}
    >
      <select
        id={id}
        className={s.control}
        required={required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errorId)}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  children: ReactNode;
  error?: string;
};

export function Checkbox({ children, error, ...rest }: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={s.field}>
      <label className={s.checkbox} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className={s.checkboxInput}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <span>{children}</span>
      </label>
      {error ? (
        <span className={s.error} id={errorId} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </span>
      ) : null}
    </div>
  );
}

type FileProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string;
  buttonLabel: string;
  hint?: string;
};

export function FileInput({ label, buttonLabel, hint, ...rest }: FileProps) {
  const id = useId();
  return (
    <div className={s.field}>
      <span className={s.label}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input id={id} type="file" className={s.fileInput} {...rest} />
        <label className={s.file} htmlFor={id}>
          <Icon name="upload" size={20} />
          {buttonLabel}
        </label>
      </div>
      {hint ? <span className={s.hint}>{hint}</span> : null}
    </div>
  );
}

export function FormStatus({
  tone,
  title,
  children,
}: {
  tone: 'success' | 'error' | 'info';
  title: string;
  children?: ReactNode;
}) {
  const toneClass = tone === 'success' ? s.statusSuccess : tone === 'error' ? s.statusError : s.statusInfo;
  const icon = tone === 'success' ? 'check' : tone === 'error' ? 'alert' : 'info';
  return (
    <div
      className={[s.status, toneClass].filter(Boolean).join(' ')}
      role={tone === 'error' ? 'alert' : 'status'}
      /* без явного aria-live часть скринридеров не объявит смену состояния (WCAG 4.1.3) */
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Icon name={icon} size={20} />
      <div>
        <p className={s.statusTitle}>{title}</p>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}

export const formStyles = s;
