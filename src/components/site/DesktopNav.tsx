'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import type { NavItem } from '@/content/types';
import s from './site.module.css';

/**
 * Desktop-меню.
 *
 * В строку помещается столько пунктов, сколько есть места; остальные уходят
 * в выпадающий список «Ещё». Состав разделов при этом не меняется и ни один
 * пункт не пропадает (ТЗ §5, §8) — группировка меню требует отдельного
 * согласования и здесь не выполняется.
 */
export function DesktopNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(items.length);
  const [moreOpen, setMoreOpen] = useState(false);

  const recalc = useCallback(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;

    const available = nav.clientWidth;
    const widths = Array.from(measure.children).map((el) => (el as HTMLElement).offsetWidth);
    const gap = 4;
    const moreWidth = 96;

    let used = 0;
    let fit = 0;
    for (const w of widths) {
      const next = used + w + (fit > 0 ? gap : 0);
      if (next > available) break;
      used = next;
      fit += 1;
    }

    // если поместились не все, нужно оставить место под кнопку «Ещё»
    if (fit < widths.length) {
      while (fit > 0 && used + gap + moreWidth > available) {
        const w = widths[fit - 1];
        if (w === undefined) break;
        used -= w + (fit > 1 ? gap : 0);
        fit -= 1;
      }
    }

    setVisibleCount(fit);
  }, []);

  useLayoutEffect(() => {
    recalc();
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(recalc);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [recalc]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const visible = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);

  const renderItem = (item: NavItem) => {
    if (item.href === null) {
      return (
        <span
          key={item.label}
          className={[s.navLink, s.navPending].join(' ')}
          title="Адрес страницы уточняется на этапе инвентаризации"
        >
          {item.label}
        </span>
      );
    }
    const active = pathname === item.href;
    return (
      <span key={item.label} className={s.navItem}>
        <Link
          className={[s.navLink, active ? s.navLinkActive : ''].filter(Boolean).join(' ')}
          href={item.href}
          aria-current={active ? 'page' : undefined}
        >
          {item.label}
        </Link>
      </span>
    );
  };

  return (
    <nav className={s.nav} aria-label="Основное меню">
      {/* скрытый слой для измерения полной ширины пунктов */}
      <div className={s.navMeasure} ref={measureRef} aria-hidden="true">
        {items.map((item) => (
          <span key={item.label} className={s.navLink}>
            {item.label}
          </span>
        ))}
      </div>

      <div ref={navRef} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
        {visible.map(renderItem)}
      </div>

      {hidden.length > 0 ? (
        <div className={s.moreWrap} ref={moreRef}>
          <button
            type="button"
            className={s.moreBtn}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            onClick={() => setMoreOpen((v) => !v)}
          >
            Ещё
            <Icon name="chevron-down" size={18} />
          </button>
          {moreOpen ? (
            <ul className={s.moreMenu}>
              {hidden.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link className={s.moreLink} href={item.href} onClick={() => setMoreOpen(false)}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={[s.moreLink, s.navPending].join(' ')}>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
