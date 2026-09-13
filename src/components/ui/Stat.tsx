import type { ReactNode } from 'react';
import s from './ui.module.css';

export type StatItem = {
  value: string;
  label: string;
};

type Props = {
  items: readonly StatItem[];
  onDark?: boolean;
};

/**
 * Блок «цифры». Значения приходят из слоя контента и не вычисляются
 * и не округляются в компоненте (ТЗ §7).
 */
export function Stats({ items, onDark = false }: Props) {
  return (
    <dl className={s.statList}>
      {items.map((item) => (
        <div key={item.label} className={[s.stat, onDark ? s.statOnDark : ''].filter(Boolean).join(' ')}>
          <dt className="visually-hidden">{item.label}</dt>
          <dd style={{ margin: 0 }}>
            <span className={s.statValue}>{item.value}</span>
            <span className={s.statLabel} aria-hidden="true">
              {item.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Quote({
  children,
  author,
  role,
  avatar,
}: {
  children: ReactNode;
  author?: string;
  role?: string;
  avatar?: ReactNode;
}) {
  return (
    <figure className={s.quote}>
      <blockquote className={s.quoteText}>{children}</blockquote>
      {author ? (
        <figcaption className={s.quoteFoot}>
          {avatar}
          <span>
            <strong>{author}</strong>
            {role ? <> · {role}</> : null}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
