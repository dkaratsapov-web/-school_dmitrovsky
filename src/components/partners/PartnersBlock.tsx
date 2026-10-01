'use client';

import Image from 'next/image';
import { useEffect, useId, useRef } from 'react';
import logoBlue from '@/assets/brand/logo.png';
import { asset } from '@/lib/asset';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './partners-block.module.css';

/** Вуз-партнёр: знак появляется, когда школа его передаёт. */
export type Partner = {
  name: string;
  logo?: { src: string; width: number; height: number; alt: string };
};

export type Partners = {
  title: string;
  items: readonly Partner[];
};

/**
 * Сотрудничество с партнерами.
 *
 * Блок общий для страниц профильных классов: разбор один, меняется только
 * список вузов.
 *
 * Карточки встают в один ряд. Наверху карточки — место под знак вуза;
 * пока школа не прислала логотипы, в нём стоит знак школы. Подставить
 * настоящий знак — одно поле в наполнении, вёрстка уже рассчитана.
 *
 * Карточка раскрывается, когда доходит до окна: кольцо дочерчивается,
 * следом проявляется название. Без скрипта и при выключенной анимации
 * всё стоит в конечном виде.
 *
 * Названия вузов перенесены дословно и не сокращаются.
 */
export function PartnersBlock({ partners }: { partners: Partners }) {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const titleId = useId();

  /* Столбцов ровно столько, сколько вузов: у разных профилей их разное
     число. На среднем экране больше трёх в ряд не ставим — названия вузов
     длинные, в узком столбце они рассыпаются. Раскладка приходит целиком:
     число внутри repeat() из переменной браузер не принимает. */
  const n = partners.items.length;
  const track = `repeat(${n}, minmax(0, 1fr))`;
  const trackMid = `repeat(${Math.min(3, n)}, minmax(0, 1fr))`;
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
    <section className={s.section} ref={ref} aria-labelledby={titleId}>
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
        <h2 className={s.title} id={titleId}>
          {partners.title}
        </h2>

        <ul
          className={s.list}
          ref={listRef}
          style={{ '--track': track, '--track-md': trackMid } as React.CSSProperties}
        >
          {partners.items.map((partner, i) => (
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
                  <Image className={s.ring} src={logoBlue} alt="" />
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
