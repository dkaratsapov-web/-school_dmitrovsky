'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import logoBlue from '@/assets/brand/logo.png';
import { Icon } from '../ui/Icon';
import { BrandIcon } from '../ui/BrandIcon';
import type { BrandName } from '../ui/BrandIcon';
import { MobileMenu } from './MobileMenu';
import { contacts, siteName } from '@/content/site';
import { headerNav, mainNav } from '@/content/navigation';
import { useScrollY } from '@/lib/motion';
import s from './site-header.module.css';

/**
 * Шапка сайта — во всю ширину, два уровня.
 *
 * Верхний уровень — реквизиты и связь, он уезжает при прокрутке.
 * Нижний — логотип, текстовая навигация и главное действие; он остаётся
 * у верха окна и сжимается.
 *
 * Вместо сетки одинаковых кнопок — набранная навигация с одной бегущей
 * подсветкой: она перетекает к тому пункту, на который наведён курсор,
 * и возвращается к текущему разделу. По нижнему краю идёт полоса
 * прочтения страницы, связанная с прокруткой.
 */

const COLLAPSE_AT = 48;
const PENDING = '#';

/** Сети, для которых есть фирменный знак. */
const BRANDS: readonly BrandName[] = ['Telegram', 'ВКонтакте', 'MAX', 'Rutube'];

function brandOf(network: string): BrandName | null {
  return BRANDS.find((b) => b === network) ?? null;
}

type Marker = { left: number; width: number; visible: boolean };

export function SiteHeader() {
  const pathname = usePathname();
  const y = useScrollY();
  const compact = y > COLLAPSE_AT;

  const [menuOpen, setMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [marker, setMarker] = useState<Marker>({ left: 0, width: 0, visible: false });

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  /* Первому экрану нужна точная высота шапки: она меняется при сжатии. */
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const write = () => {
      document.documentElement.style.setProperty('--header-h', `${Math.round(el.offsetHeight)}px`);
    };
    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Доля прочитанной страницы — пишется прямо в стиль полосы,
     без состояния React: перерисовка на каждый кадр не нужна. */
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, y / total)) : 0;
    el.style.transform = `scaleX(${p.toFixed(4)})`;
  }, [y]);

  /** Подсветка встаёт под указанный пункт. */
  const moveMarker = useCallback((el: HTMLElement | null) => {
    const nav = navRef.current;
    if (!nav || !el) {
      setMarker((m) => ({ ...m, visible: false }));
      return;
    }
    const nb = nav.getBoundingClientRect();
    const eb = el.getBoundingClientRect();
    setMarker({ left: eb.left - nb.left, width: eb.width, visible: true });
  }, []);

  /** Возврат подсветки к текущему разделу. */
  const restMarker = useCallback(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[data-active="true"]');
    moveMarker(active ?? null);
  }, [moveMarker]);

  useEffect(() => {
    restMarker();
    window.addEventListener('resize', restMarker);
    return () => window.removeEventListener('resize', restMarker);
  }, [restMarker, pathname, compact]);

  /* Выпадающий список закрывается по Escape и клику вне шапки. */
  useEffect(() => {
    if (openSub === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSub(null);
    };
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenSub(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [openSub]);

  const phone = contacts.phones[0];
  const address = contacts.addresses[0];

  const isActive = (item: (typeof headerNav)[number]) =>
    item.href === pathname || item.children?.some((c) => c.href === pathname) === true;

  return (
    <header ref={headerRef} className={[s.header, compact ? s.compact : ''].filter(Boolean).join(' ')}>
      {/* ------------------------------------------------- верхний уровень */}
      <div className={s.utility}>
        <div className={s.utilityInner}>
          <a className={s.utilityLink} href={PENDING}>
            <Icon name="eye" size={15} />
            Версия для слабовидящих
          </a>

          <span className={s.utilitySpacer} />

          {address ? (
            <span className={s.utilityText}>
              <Icon name="pin" size={15} />
              {address}
            </span>
          ) : null}

          <span className={s.socials}>
            {contacts.socials.map((soc) => {
              const brand = brandOf(soc.network);
              return (
                <a
                  key={soc.href}
                  className={s.social}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.label}
                  title={soc.label}
                >
                  {brand ? (
                    <BrandIcon name={brand} size={17} />
                  ) : (
                    <span className={s.socialText}>{soc.label.slice(0, 2)}</span>
                  )}
                </a>
              );
            })}
          </span>
        </div>
      </div>

      {/* -------------------------------------------------- нижний уровень */}
      <div className={s.bar}>
        <div className={s.barInner}>
          <Link className={s.brand} href="/" aria-label={`${siteName} — на главную`}>
            <Image className={s.mark} src={logoBlue} alt="" priority />
            <span className={s.brandText}>
              <span className={s.brandLine}>Школа</span>
              <span className={s.brandName}>«Дмитровский»</span>
            </span>
          </Link>

          <nav
            className={s.nav}
            aria-label="Основное меню"
            ref={navRef}
            onMouseLeave={() => {
              restMarker();
              setOpenSub(null);
            }}
          >
            <span
              className={s.marker}
              aria-hidden="true"
              style={{
                transform: `translateX(${marker.left}px) scaleX(${marker.width || 1})`,
                opacity: marker.visible ? 1 : 0,
              }}
            />

            {headerNav.map((item) => {
              const active = isActive(item);

              if (item.children) {
                const open = openSub === item.label;
                return (
                  <span
                    key={item.label}
                    className={s.navItem}
                    onMouseEnter={(e) => {
                      moveMarker(e.currentTarget.firstElementChild as HTMLElement);
                      setOpenSub(item.label);
                    }}
                  >
                    <button
                      type="button"
                      className={s.navLink}
                      data-active={active}
                      aria-expanded={open}
                      aria-haspopup="true"
                      onClick={() => setOpenSub(open ? null : item.label)}
                    >
                      {item.label}
                      <Icon name="chevron-down" size={16} className={s.chev} />
                    </button>

                    <div className={s.sub} hidden={!open}>
                      <ul className={s.subList}>
                        {item.children.map((child, i) => (
                          <li key={child.label} style={{ '--i': i } as React.CSSProperties}>
                            <Link
                              className={s.subLink}
                              href={child.href ?? '/'}
                              onClick={() => setOpenSub(null)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </span>
                );
              }

              return (
                <span
                  key={item.label}
                  className={s.navItem}
                  onMouseEnter={(e) => {
                    moveMarker(e.currentTarget.firstElementChild as HTMLElement);
                    setOpenSub(null);
                  }}
                >
                  <Link
                    className={s.navLink}
                    data-active={active}
                    href={item.href ?? '/'}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </span>
              );
            })}
          </nav>

          <div className={s.actions}>
            {phone ? (
              <a className={s.phone} href={`tel:${phone.tel}`}>
                <span className={s.phoneIcon}>
                  <Icon name="phone" size={17} />
                </span>
                <span className={s.phoneNum}>{phone.display}</span>
              </a>
            ) : null}

            <a className={s.cta} href={PENDING}>
              <span className={s.ctaLabel}>Заказать звонок</span>
            </a>

            {phone ? (
              <a className={s.call} href={`tel:${phone.tel}`} aria-label={`Позвонить ${phone.display}`}>
                <Icon name="phone" size={19} />
              </a>
            ) : null}

            <button
              type="button"
              className={s.burger}
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
            >
              <span className={s.burgerBar} />
              <span className={s.burgerBar} />
              <span className={s.burgerBar} />
            </button>
          </div>
        </div>

        {/* полоса прочтения страницы */}
        <span ref={progressRef} className={s.progress} aria-hidden="true" />
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={mainNav}
        contacts={contacts}
      />
    </header>
  );
}
