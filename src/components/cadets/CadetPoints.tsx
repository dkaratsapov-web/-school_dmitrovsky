'use client';

import { useEffect, useRef } from 'react';
import { cadetPointsFull, cadetPointsTitle } from '@/content/cadets';
import { prefersReducedMotion } from '@/lib/motion';
import s from './cadet-points.module.css';

/**
 * Что входит в проект — двенадцать карточек.
 *
 * Карточки выходят волной по диагонали, а бордовая черта дорисовывается
 * уже после того, как карточка встала на место: так двенадцать плиток
 * не читаются одним полотном.
 *
 * Появляются по мере попадания в окно. Без скрипта видны сразу —
 * ничего не прячется в ожидании наблюдателя.
 */
export function CadetPoints() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-point]'));
    const showAll = () => items.forEach((el) => el.setAttribute('data-in', 'true'));

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      showAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', 'true');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );
    items.forEach((el) => io.observe(el));

    /* страховка: наблюдатель не сработал — пункты всё равно показываются */
    const safety = window.setTimeout(showAll, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section className={s.section} aria-labelledby="cadet-points-title">
      <div className={s.inner}>
        <h2 className={s.title} id="cadet-points-title">
          {cadetPointsTitle}
        </h2>

        <ul className={s.list} ref={listRef}>
          {cadetPointsFull.map((point, i) => (
            <li
              className={s.point}
              key={point.title}
              data-point=""
              /* задержка = столбец + ряд: карточки выходят волной наискось */
              style={{ '--d': (i % 3) + Math.floor(i / 3) } as React.CSSProperties}
            >
              <span className={s.mark} aria-hidden="true" />
              <span className={s.body}>
                <span className={s.pointTitle}>{point.title}</span>
                {point.text ? <span className={s.pointText}>{point.text}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
