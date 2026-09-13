import Link from 'next/link';
import { Icon } from './Icon';
import s from './ui.module.css';

type Props = {
  current: number;
  total: number;
  /** Функция построения ссылки на страницу — URL задаёт вызывающая страница. */
  hrefForPage: (page: number) => string;
};

function pageList(current: number, total: number): readonly (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | 'gap')[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) out.push('gap');
  for (let p = from; p <= to; p += 1) out.push(p);
  if (to < total - 1) out.push('gap');
  out.push(total);
  return out;
}

export function Pagination({ current, total, hrefForPage }: Props) {
  if (total <= 1) return null;
  return (
    <nav className={s.pagination} aria-label="Постраничная навигация">
      {current > 1 ? (
        <Link className={s.pageBtn} href={hrefForPage(current - 1)} rel="prev" aria-label="Предыдущая страница">
          <Icon name="chevron-left" size={20} />
        </Link>
      ) : null}

      {pageList(current, total).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className={s.pageEllipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(p)}
            className={[s.pageBtn, p === current ? s.pageCurrent : ''].filter(Boolean).join(' ')}
            aria-label={`Страница ${p}`}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {current < total ? (
        <Link className={s.pageBtn} href={hrefForPage(current + 1)} rel="next" aria-label="Следующая страница">
          <Icon name="chevron-right" size={20} />
        </Link>
      ) : null}
    </nav>
  );
}
