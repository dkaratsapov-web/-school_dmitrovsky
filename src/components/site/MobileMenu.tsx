'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../ui/Icon';
import { ButtonLink } from '../ui/Button';
import type { NavItem, SiteContacts } from '@/content/types';
import s from './site.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  items: readonly NavItem[];
  contacts: SiteContacts;
  /** Главное действие шапки. Текст и адрес берутся из текущего сайта. */
  cta?: { label: string; href: string };
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Мобильное меню: выезжающая панель со всеми текущими пунктами (ТЗ §9),
 * закрытие по Escape, клику по подложке и выбору пункта, ловушка фокуса.
 */
export function MobileMenu({ open, onClose, items, contacts, cta }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
      restoreTo.current?.focus();
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className={s.sheetOverlay} onMouseDown={onClose} aria-hidden="true" />
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Меню сайта"
        ref={panelRef}
      >
        <div className={s.sheetHead}>
          <span className={s.sheetTitle}>Меню</span>
          <button type="button" className={s.burger} onClick={onClose} aria-label="Закрыть меню">
            <Icon name="close" size={22} />
          </button>
        </div>

        <div className={s.sheetBody}>
          <ul className={s.sheetNav}>
            {items.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link className={s.sheetLink} href={item.href} onClick={onClose}>
                    {item.label}
                    <Icon name="chevron-right" size={20} />
                  </Link>
                ) : (
                  <span className={s.sheetLink} style={{ color: 'var(--c-ink-300)' }}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={s.sheetFoot}>
          {contacts.phones.length > 0 ? (
            <div className={s.sheetContacts}>
              {contacts.phones.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className={s.utilityLink} style={{ color: 'var(--c-navy-800)' }}>
                  <Icon name="phone" size={18} />
                  {p.display}
                </a>
              ))}
            </div>
          ) : null}
          {cta ? (
            <ButtonLink href={cta.href} variant="primary" block onClick={onClose}>
              {cta.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
