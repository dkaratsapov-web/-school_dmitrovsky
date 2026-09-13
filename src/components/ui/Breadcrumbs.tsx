import Link from 'next/link';
import { Fragment } from 'react';
import s from './ui.module.css';

export type Crumb = {
  label: string;
  href?: string;
};

/** Хлебные крошки. Последний элемент — текущая страница, без ссылки. */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav className={s.crumbs} aria-label="Вы находитесь здесь">
      <ol className={s.crumbsList}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li>
                {item.href && !isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span className={s.crumbCurrent} aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast ? (
                <li aria-hidden="true" className={s.crumbSep}>
                  /
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
