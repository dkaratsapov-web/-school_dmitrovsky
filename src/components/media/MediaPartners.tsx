'use client';

import { useEffect, useRef } from 'react';
import { mediaPartners } from '@/content/media';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './media-partners.module.css';

/**
 * Сотрудничество с партнерами.
 *
 * Знак школы — атом с орбитами, и здесь этот мотив работает по делу:
 * вуз-партнёр стоит на своей орбите вокруг школы. У каждого партнёра
 * своё кольцо, и спутник обходит его со своей скоростью — три строки
 * живут по-разному, а не мигают в такт.
 *
 * Кольцо дочерчивается, когда строка появляется в окне, и следом
 * раскрывается линия под названием. Без скрипта и при выключенной
 * анимации всё стоит в конечном виде: кольца целые, названия на месте.
 *
 * Названия вузов перенесены дословно и не сокращаются.
 */
export function MediaPartners() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-row]'));
    const showAll = () => rows.forEach((el) => el.setAttribute('data-in', 'true'));

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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.3 },
    );
    rows.forEach((el) => io.observe(el));

    /* страховка: наблюдатель не сработал — строки всё равно видны */
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
          {mediaPartners.items.map((name, i) => (
            <li
              className={s.row}
              key={name}
              data-row=""
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className={s.mark}>
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
              </span>

              <p className={s.name}>{name}</p>

              <span className={s.rule} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
