'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import logoBlue from '@/assets/brand/logo.png';
import { Icon } from '../ui/Icon';
import { BrandIcon } from '../ui/BrandIcon';
import type { BrandName } from '../ui/BrandIcon';
import { CallbackModal } from '../forms/CallbackModal';
import { DirectorForm } from '../forms/DirectorForm';
import { MobileMenu } from './MobileMenu';
import type { MenuEntry } from './MobileMenu';
import { InfoBody } from '../ui/InfoBody';
import { contacts, siteName } from '@/content/site';
import { accessInfo, landingAnchors, landingNav, stageInfo } from '@/content/landing';
import type { LandingInfo } from '@/content/landing';
import { stages } from '@/content/stages';
import { useScrollY } from '@/lib/motion';
import s from './site-header.module.css';

/**
 * Шапка сайта — капсулы поверх первого экрана.
 *
 * Собрана из отдельных капсул с промежутками между ними, а не одной
 * сплошной полосой: логотип, навигация и действия живут в своих оболочках
 * с обводкой. Над видео капсулы прозрачные с размытием, при прокрутке
 * набирают плотность, сжимаются и промежутки между ними уменьшаются.
 */

const COLLAPSE_AT = 40;

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
  /* «Заказать звонок» открывает окно с формой, а не ведёт по якорю. */
  const [callOpen, setCallOpen] = useState(false);
  /* «Написать директору» — окно с расширенной формой. */
  const [letterOpen, setLetterOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  /* Главная работает как лендинг: пункты без своего блока раскрываются окном. */
  const [info, setInfo] = useState<LandingInfo | null>(null);
  /* Раздел, который сейчас на экране — подсвечивается в меню. */
  const [here, setHere] = useState<string | null>(null);
  const [marker, setMarker] = useState<Marker>({ left: 0, width: 0, visible: false });

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

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

  /* Доля прочитанной страницы — пишется прямо в стиль, без состояния React. */
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, y / total)) : 0;
    el.style.transform = `scaleX(${p.toFixed(4)})`;
  }, [y]);

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

  const restMarker = useCallback(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    moveMarker(active ?? null);
  }, [moveMarker]);

  useEffect(() => {
    restMarker();
    window.addEventListener('resize', restMarker);
    return () => window.removeEventListener('resize', restMarker);
  }, [restMarker, pathname, compact]);

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

  /* Какой блок сейчас под шапкой. Наблюдатель, а не расчёт на каждый кадр. */
  useEffect(() => {
    if (pathname !== '/' || typeof IntersectionObserver === 'undefined') return;
    const nodes = landingAnchors
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (nodes.length === 0) return;

    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
        let best: string | null = null;
        let top = 0.08;
        seen.forEach((ratio, id) => {
          if (ratio > top) {
            top = ratio;
            best = id;
          }
        });
        setHere(best);
      },
      { threshold: [0, 0.12, 0.3, 0.6], rootMargin: '-20% 0px -40% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  const phone = contacts.phones[0];
  const address = contacts.addresses[0];

  /* Пункт активен, если его блок сейчас на экране. */
  const isHere = (anchor: string | undefined) =>
    anchor !== undefined && here !== null && anchor === `/#${here}`;

  /* Мобильное меню: те же пункты, ступени обучения развёрнуты списком. */
  const mobileItems: readonly MenuEntry[] = landingNav.flatMap((item) =>
    item.stages
      ? item.stages.map((stage) => ({
          label: stage.title,
          onSelect: () => setInfo(stageInfo(stage)),
        }))
      : [
          item.anchor
            ? { label: item.label, href: item.anchor }
            : { label: item.label, onSelect: () => item.info && setInfo(item.info) },
        ],
  );

  return (
    <header ref={headerRef} className={[s.header, compact ? s.compact : ''].filter(Boolean).join(' ')}>
      {/* --------------------------------------------- верхний ряд капсул */}
      <div className={s.rowTop}>
        <button
          type="button"
          className={[s.capsule, s.chip].join(' ')}
          style={{ '--d': '0ms' } as React.CSSProperties}
          onClick={() => setInfo(accessInfo)}
        >
          <Icon name="eye" size={15} />
          <span className={s.chipText}>Версия для слабовидящих</span>
        </button>

        <span className={s.gap} />

        {/* Ступени обучения вынесены в верхний ряд: на первом экране видно
            всё меню целиком, при прокрутке ряд схлопывается и они
            возвращаются в выпадающий список «Обучение». */}
        <nav
          className={[s.capsule, s.studyNav].join(' ')}
          aria-label="Ступени обучения"
          style={{ '--d': '110ms' } as React.CSSProperties}
        >
          <span className={s.studyLabel}>Обучение</span>
          {stages.map((stage, i) => (
            <button
              key={stage.href}
              type="button"
              className={s.studyLink}
              style={{ '--i': i } as React.CSSProperties}
              tabIndex={compact ? -1 : undefined}
              onClick={() => setInfo(stageInfo(stage))}
            >
              {stage.title}
            </button>
          ))}
        </nav>

        <span className={s.gap} />

        {address ? (
          <span className={[s.capsule, s.chip, s.chipMuted].join(' ')} style={{ '--d': '70ms' } as React.CSSProperties}>
            <Icon name="pin" size={15} />
            <span className={s.chipText}>{address}</span>
          </span>
        ) : null}

        <span className={[s.capsule, s.socials].join(' ')} style={{ '--d': '140ms' } as React.CSSProperties}>
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
                {brand ? <BrandIcon name={brand} size={16} /> : soc.label.slice(0, 2)}
              </a>
            );
          })}
        </span>
      </div>

      {/* --------------------------------------------- нижний ряд капсул */}
      <div className={s.rowMain}>
        <Link
          className={[s.capsule, s.brand].join(' ')}
          href="/"
          aria-label={`${siteName} — на главную`}
          style={{ '--d': '0ms' } as React.CSSProperties}
        >
          <span className={s.markRing}>
            <Image className={s.mark} src={logoBlue} alt="" priority />
          </span>
          <span className={s.brandText}>
            <span className={s.brandLine}>ГБОУ Школа</span>
            <span className={s.brandName}>«Дмитровский»</span>
          </span>
        </Link>

        <nav
          className={[s.capsule, s.nav].join(' ')}
          aria-label="Основное меню"
          ref={navRef}
          style={{ '--d': '90ms' } as React.CSSProperties}
          onMouseLeave={() => {
            restMarker();
            setOpenSub(null);
          }}
        >
          <span
            className={s.marker}
            aria-hidden="true"
            style={{
              transform: `translateX(${marker.left}px)`,
              width: marker.width || 1,
              opacity: marker.visible ? 1 : 0,
            }}
          />

          {landingNav.map((item) => {
            const active = isHere(item.anchor);

            if (item.stages) {
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
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenSub(open ? null : item.label)}
                  >
                    {item.label}
                    <Icon name="chevron-down" size={15} className={s.chev} />
                  </button>

                  <div className={s.sub} hidden={!open}>
                    <ul className={s.subList}>
                      {item.stages.map((stage, i) => (
                        <li key={stage.href} style={{ '--i': i } as React.CSSProperties}>
                          <button
                            type="button"
                            className={s.subLink}
                            onClick={() => {
                              setOpenSub(null);
                              setInfo(stageInfo(stage));
                            }}
                          >
                            {stage.title}
                          </button>
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
                {item.anchor ? (
                  <Link
                    className={s.navLink}
                    data-active={active}
                    href={item.anchor}
                    aria-current={active ? 'true' : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={s.navLink}
                    onClick={() => item.info && setInfo(item.info)}
                  >
                    {item.label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>

        <div className={s.actions} style={{ '--d': '180ms' } as React.CSSProperties}>
          {phone ? (
            <a className={[s.capsule, s.phone].join(' ')} href={`tel:${phone.tel}`}>
              <span className={s.phoneIcon}>
                <Icon name="phone" size={16} />
              </span>
              <span className={s.phoneNum}>{phone.display}</span>
            </a>
          ) : null}

          <button
            className={[s.capsule, s.letter].join(' ')}
            type="button"
            onClick={() => setLetterOpen(true)}
          >
            <Icon name="mail" size={16} />
            <span className={s.letterLabel}>Написать директору</span>
          </button>

          <button
            className={[s.capsule, s.cta].join(' ')}
            type="button"
            onClick={() => setCallOpen(true)}
          >
            <span className={s.ctaLabel}>Заказать звонок</span>
            <span className={s.ctaDot} aria-hidden="true" />
          </button>

          {phone ? (
            <a className={[s.capsule, s.call].join(' ')} href={`tel:${phone.tel}`} aria-label={`Позвонить ${phone.display}`}>
              <Icon name="phone" size={18} />
            </a>
          ) : null}

          <button
            type="button"
            className={[s.capsule, s.burger].join(' ')}
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

      <span ref={progressRef} className={s.progress} aria-hidden="true" />

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={mobileItems}
        contacts={contacts}
      />

      <CallbackModal open={callOpen} onClose={() => setCallOpen(false)} />

      <CallbackModal
        open={info !== null}
        onClose={() => setInfo(null)}
        title={info?.title ?? ''}
        text={info?.lead ?? ''}
        wide
      >
        <InfoBody
          {...(info?.text ? { text: info.text } : {})}
          {...(info?.points ? { points: info.points } : {})}
          {...(info?.facts ? { facts: info.facts } : {})}
          {...(info?.link ? { link: info.link } : {})}
        />
      </CallbackModal>

      <CallbackModal
        open={letterOpen}
        onClose={() => setLetterOpen(false)}
        title="Написать директору"
        text="Расскажите, с чем обращаетесь. Ответим на указанную почту или по телефону."
        wide
      >
        <DirectorForm />
      </CallbackModal>
    </header>
  );
}
