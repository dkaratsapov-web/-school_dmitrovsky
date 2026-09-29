'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { mediaPartners } from '@/content/media';
import { asset } from '@/lib/asset';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './media-partners.module.css';

/**
 * Сотрудничество с партнерами.
 *
 * Три карточки в ряд. Наверху карточки — место под знак вуза; пока школа
 * не прислала логотипы, в нём стоит знак школы: атом с орбитами, по одной
 * орбите на карточку, и спутник обходит её со своей скоростью. Подставить
 * настоящий знак — одно поле в content/media.ts, вёрстка уже рассчитана.
 *
 * Карточка раскрывается, когда доходит до окна: кольцо дочерчивается,
 * следом проявляется название. Без скрипта и при выключенной анимации
 * всё стоит в конечном виде.
 *
 * Названия вузов перенесены дословно и не сокращаются.
 */
export function MediaPartners() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-card]'));
    const showAll = () => cards.forEach((el) => el.setAttribute('data-in', 'true'));

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      showAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', 'true');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.25 },
    );
    cards.forEach((el) => io.observe(el));

    /* страховка: наблюдатель не сработал — карточки всё равно видны */
    const safety = window.setTimeout(showAll, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section className={s.section} ref={ref} aria-labelledby="media-partners-title">
      {/* большая орбита по фону: декоративный слой, едет от прокрутки */}
      <span className={s.backdrop} aria-hidden="true">
        <svg className={s.sky} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="600" cy="300" rx="560" ry="200" transform="rotate(-14 600 300)" />
          <ellipse cx="600" cy="300" rx="430" ry="150" transform="rotate(16 600 300)" />
          <ellipse cx="600" cy="300" rx="300" ry="104" transform="rotate(-38 600 300)" />
        </svg>
        <span className={s.glow} />
      </span>

      <div className={s.inner}>
        <h2 className={s.title} id="media-partners-title">
          {mediaPartners.title}
        </h2>

        <ul className={s.list} ref={listRef}>
          {mediaPartners.items.map((partner, i) => (
            <li
              className={s.card}
              key={partner.name}
              data-card=""
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className={s.plate}>
                {partner.logo ? (
                  <Image
                    className={s.logo}
                    src={asset(partner.logo.src)}
                    alt={partner.logo.alt}
                    width={partner.logo.width}
                    height={partner.logo.height}
                    sizes="(min-width: 900px) 12rem, 60vw"
                  />
                ) : (
                  <svg className={s.ring} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                    <circle className={s.orbit} cx="32" cy="32" r="27" />
                    <g className={s.spin}>
                      <ellipse
                        className={s.arc}
                        cx="32"
                        cy="32"
                        rx="27"
                        ry="10.5"
                        transform="rotate(-26 32 32)"
                      />
                      <circle className={s.sat} cx="59" cy="32" r="2.8" />
                    </g>
                    <circle className={s.core} cx="32" cy="32" r="4.6" />
                  </svg>
                )}
              </span>

              <p className={s.name}>{partner.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
