'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import logoBlue from '@/assets/brand/logo.png';
import { Icon } from '../ui/Icon';
import { MobileMenu } from './MobileMenu';
import { contacts, siteName } from '@/content/site';
import { headerNav, mainNav } from '@/content/navigation';
import { useScrollY } from '@/lib/motion';
import s from './site-header.module.css';

/**
 * Двухуровневая шапка.
 *
 * Верхний уровень — реквизиты и действия, нижний — навигация пилюлями.
 * При прокрутке верхний уровень уезжает вверх и схлопывается, навигация
 * прилипает к верху окна и сжимается. Анимируются только transform,
 * opacity и max-height у схлопывающегося уровня.
 *
 * Состав взят с действующего сайта: адрес, телефон, соцсети, версия для
 * слабовидящих, «Контакты», «Заказать звонок», десять разделов меню
 * и «Письмо директору».
 */

const COLLAPSE_AT = 60;

/** Действия, для которых пока стоят заглушки — см. QUESTIONS.md. */
const PENDING = '#';

/** Монограммы соцсетей. Настоящие иконки запрошены — QUESTIONS.md. */
const MONOGRAM: Record<string, string> = {
  Telegram: 'TG',
  ВКонтакте: 'VK',
  MAX: 'MAX',
  Rutube: 'RT',
};

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const y = useScrollY();
  const compact = y > COLLAPSE_AT;
  const headerRef = useRef<HTMLElement>(null);

  /* Первому экрану нужна точная высота шапки: она разная на разных ширинах,
     потому что ряды пилюль переносятся. Пишем её в переменную документа. */
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const write = () => {
      document.documentElement.style.setProperty('--header-h', `${Math.round(el.offsetHeight)}px`);
    };
    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    window.addEventListener('resize', write);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', write);
    };
  }, []);

  const phone = contacts.phones[0];
  const address = contacts.addresses[0];

  return (
    <header ref={headerRef} className={[s.header, compact ? s.compact : ''].filter(Boolean).join(' ')}>
      {/* ----------------------------------------------- нулевой уровень */}
      <div className={s.access}>
        <a className={s.accessLink} href={PENDING}>
          <Icon name="eye" size={16} />
          Версия для слабовидящих
        </a>
      </div>

      {/* ----------------------------------------------- верхний уровень */}
      <div className={s.upper}>
        <div className={s.upperInner}>
          <Link className={s.brand} href="/" aria-label={`${siteName} — на главную`}>
            <span className={s.mark}>
              <Image src={logoBlue} alt="" priority className={s.markImg} />
            </span>
            <span className={s.brandText}>
              Школа
              <span className={s.brandStrong}>«Дмитровский»</span>
            </span>
          </Link>

          {address ? (
            <span className={s.meta}>
              <Icon name="pin" size={18} className={s.metaIcon} />
              {address}
            </span>
          ) : null}

          {phone ? (
            <a className={s.phone} href={`tel:${phone.tel}`}>
              <Icon name="phone" size={18} className={s.metaIcon} />
              {phone.display}
            </a>
          ) : null}

          <div className={s.socials}>
            {contacts.socials.map((soc) => (
              <a
                key={soc.href}
                className={s.social}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={soc.label}
              >
                {MONOGRAM[soc.network] ?? soc.label.slice(0, 2)}
              </a>
            ))}
          </div>

          <div className={s.upperActions}>
            <Link className={s.btnOutline} href="/contacts">
              Контакты
            </Link>
            <a className={s.btnSolid} href={PENDING}>
              Заказать звонок
            </a>
          </div>

          {phone ? (
            <a className={s.callBtn} href={`tel:${phone.tel}`} aria-label={`Позвонить ${phone.display}`}>
              <Icon name="phone" size={20} />
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

      {/* ----------------------------------------------- нижний уровень */}
      <div className={s.lower}>
        <nav className={s.nav} aria-label="Основное меню">
          {headerNav.map((item) => {
            const active = item.href !== null && pathname === item.href;
            return (
              <Link
                key={item.label}
                className={[s.pill, active ? s.pillActive : ''].filter(Boolean).join(' ')}
                href={item.href ?? '/'}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <a className={[s.pill, s.pillAccent].join(' ')} href={PENDING}>
            Письмо директору
          </a>
        </nav>
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
