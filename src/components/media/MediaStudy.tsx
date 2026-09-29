'use client';

import { useEffect, useRef } from 'react';
import { mediaStudy } from '@/content/media';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './media-study.module.css';

/**
 * Углублённое изучение — кадры плёнки.
 *
 * Предметы стоят кадрами на киноплёнке: перфорация сверху и снизу едет
 * вместе с прокруткой, как лента в проекторе, а сами кадры выходят
 * по очереди. Движется только перфорация — декоративный слой; текст
 * стоит на месте.
 *
 * Ниже тёмная карта с программой колледжа: профессии набраны отдельными
 * строками, потому что в источнике они идут одной фразой через запятую
 * и списком читаются быстрее.
 */
export function MediaStudy() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const stripRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const frames = Array.from(strip.querySelectorAll<HTMLElement>('[data-frame]'));
    const showAll = () => frames.forEach((el) => el.setAttribute('data-in', 'true'));

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
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    );
    frames.forEach((el) => io.observe(el));

    /* страховка: наблюдатель не сработал — кадры всё равно видны */
    const safety = window.setTimeout(showAll, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section className={s.section} ref={ref} aria-labelledby="media-study-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 className={s.title} id="media-study-title">
            {mediaStudy.title}
          </h2>
          <p className={s.lead}>{mediaStudy.lead}</p>
        </div>
      </div>

      {/* плёнка идёт во всю ширину: край экрана — край ленты */}
      <div className={s.film}>
        <span className={[s.holes, s.holesTop].join(' ')} aria-hidden="true" />

        <ul className={s.strip} ref={stripRef}>
          {mediaStudy.subjects.map((subject, i) => (
            <li
              className={s.frame}
              key={subject}
              data-frame=""
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className={s.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={s.subject}>{subject}</span>
            </li>
          ))}
        </ul>

        <span className={[s.holes, s.holesBottom].join(' ')} aria-hidden="true" />
      </div>

      <div className={s.inner}>
        <div className={s.college}>
          <p className={s.collegeLead}>{mediaStudy.collegeLead}</p>

          <ul className={s.professions}>
            {mediaStudy.professions.map((name) => (
              <li className={s.profession} key={name}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
