'use client';

import { useEffect, useRef } from 'react';
import { ConsultInline } from '../forms/ConsultInline';
import { BrandIcon } from '../ui/BrandIcon';
import type { BrandName } from '../ui/BrandIcon';
import { Icon } from '../ui/Icon';
import { consultAction, consultText, consultTitle, contactLabels } from '@/content/contacts-block';
import { contacts } from '@/content/site';
import { prefersReducedMotion } from '@/lib/motion';
import s from './contacts.module.css';

const BRANDS: readonly BrandName[] = ['Telegram', 'ВКонтакте', 'MAX', 'Rutube'];

function brandOf(network: string): BrandName | null {
  return BRANDS.find((b) => b === network) ?? null;
}

/**
 * Контакты — последний блок перед подвалом.
 *
 * Школа — это прежде всего место, поэтому адрес набран крупно и открывает
 * блок: всё остальное идёт подписями под ним. Телефоны и почта — строки
 * во всю ширину колонки, по ним удобно попасть пальцем.
 *
 * Справа форма консультации с текстами со страницы /contacts.
 *
 * Движение одно и фоновое: орбита атома за адресом смещается по мере
 * прокрутки. Это декоративный слой без текста, параллакс здесь допустим.
 */
export function Contacts() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = r.height + window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / span));
      el.style.setProperty('--sp', p.toFixed(4));
    };
    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const address = contacts.addresses[0];

  return (
    <section className={s.section} id="contacts" ref={ref} aria-labelledby="contacts-title">
      {/* орбита за адресом — фоновый слой, текста в нём нет */}
      <svg className={s.orbit} viewBox="0 0 1200 420" aria-hidden="true" preserveAspectRatio="none">
        <ellipse cx="600" cy="210" rx="580" ry="170" />
        <ellipse cx="600" cy="210" rx="430" ry="120" />
      </svg>

      <div className={s.inner}>
        <div className={s.place}>
          <h2 id="contacts-title" className={s.title}>
            Контакты
          </h2>

          {address ? (
            <p className={s.address}>
              <span className={s.label}>{contactLabels.address}</span>
              <span className={s.addressText}>{address}</span>
            </p>
          ) : null}

          <div className={s.lines}>
            <p className={s.label}>{contactLabels.phone}</p>
            {contacts.phones.map((p) => (
              <a className={s.line} key={p.tel} href={`tel:${p.tel}`}>
                <Icon name="phone" size={18} />
                <span className={s.lineText}>{p.display}</span>
              </a>
            ))}
          </div>

          <div className={s.lines}>
            <p className={s.label}>{contactLabels.email}</p>
            {contacts.emails.map((e) => (
              <a className={s.line} key={e} href={`mailto:${e}`}>
                <Icon name="mail" size={18} />
                <span className={s.lineText}>{e}</span>
              </a>
            ))}
          </div>

          {contacts.socials.length > 0 ? (
            <div className={s.lines}>
              <p className={s.label}>{contactLabels.socials}</p>
              <div className={s.socials}>
                {contacts.socials.map((soc) => {
                  const brand = brandOf(soc.network);
                  return (
                    <a
                      className={s.social}
                      key={soc.href}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={soc.label}
                      title={soc.label}
                    >
                      {brand ? <BrandIcon name={brand} size={20} /> : soc.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className={s.form}>
          <p className={s.formTitle}>{consultTitle}</p>
          <p className={s.formText}>{consultText}</p>
          <ConsultInline title="" action={consultAction} />
        </div>
      </div>
    </section>
  );
}
