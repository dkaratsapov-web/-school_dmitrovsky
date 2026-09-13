import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import s from './ui.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'onDark'
  | 'onDarkOutline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  primary: s.primary ?? '',
  secondary: s.secondary ?? '',
  outline: s.outline ?? '',
  ghost: s.ghost ?? '',
  onDark: s.onDark ?? '',
  onDarkOutline: s.onDarkOutline ?? '',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: s.sizeSm ?? '',
  md: '',
  lg: s.sizeLg ?? '',
};

type Common = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
};

function cx(v: ButtonVariant, size: ButtonSize, block: boolean, className?: string) {
  return [s.btn, variantClass[v], sizeClass[size], block ? s.block : '', className]
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  block = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cx(variant, size, block, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    /** Внешняя ссылка — открывается в новой вкладке с rel="noopener". */
    external?: boolean;
  };

export function ButtonLink({
  children,
  href,
  external = false,
  variant = 'secondary',
  size = 'md',
  block = false,
  className,
  ...rest
}: ButtonLinkProps) {
  const cls = cx(variant, size, block, className);
  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href} {...rest}>
      {children}
    </Link>
  );
}
