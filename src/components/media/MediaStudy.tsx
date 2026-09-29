'use client';

import { useEffect, useRef } from 'react';
import { mediaStudy } from '@/content/media';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './media-study.module.css';

/**
 * Углублённое изучение — эфирная сетка на мониторе аппаратной.
 *
 * Слева — приглашение школы, справа — монитор: предметы идут строками
 * сетки вещания, у каждой справа индикатор уровня. Пока строка проходит
 * середину экрана, её индикатор живой — «в эфире»; остальные лежат ровной
 * линией. Движение привязано к чтению, а не разложено одинаково по всем
 * карточкам.
 *
 * Строка про комплексную подготовку к ЕГЭ идёт бегущей строкой под сеткой:
 * это не пятый предмет, а вывод по всем четырём. Слова перенесены как есть.
 *
 * Ниже — программа колледжа: профессии висят аккредитационными бейджами
 * на рейке и качаются, каждый в своей фазе.
 */

/** Полос в индикаторе уровня. */
const BARS = 9;

/** Высоты полос в покое, доля от полной: ровная линия с лёгкой неровностью. */
const REST = [0.16, 0.1, 0.2, 0.12, 0.24, 0.12, 0.18, 0.1, 0.14];

export function MediaStudy() {
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

    /* появление строки: шторка уходит вправо, засечка слева вырастает */
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', 'true');
          reveal.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.3 },
    );

    /* «в эфире»: узкая полоса по центру окна — строка, которую читают */
    const live = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.setAttribute('data-live', 'true');
          else e.target.removeAttribute('data-live');
        });
      },
      { rootMargin: '-49% 0px -49% 0px' },
    );

    rows.forEach((el) => {
      reveal.observe(el);
      live.observe(el);
    });

    /* страховка: наблюдатель не сработал — строки всё равно открыты */
    const safety = window.setTimeout(showAll, 2500);
    return () => {
      reveal.disconnect();
      live.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section className={s.section} ref={ref} aria-labelledby="media-study-title">
      {/* фон: сетка аппаратной, точечное поле по краям и мягкая засветка */}
      <span className={s.backdrop} aria-hidden="true">
        <span className={s.grid} />
        <span className={s.dots} />
        <span className={s.glow} />
      </span>

      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.head}>
            <h2 className={s.title} id="media-study-title">
              {mediaStudy.title}
            </h2>
            <p className={s.lead}>{mediaStudy.lead}</p>
          </div>

          {/* монитор аппаратной: сетка вещания */}
          <div className={s.monitor}>
            <span className={s.scan} aria-hidden="true" />
            <span className={s.sheen} aria-hidden="true" />

            <ul className={s.list} ref={listRef}>
              {mediaStudy.subjects.map((subject, i) => (
                <li
                  className={s.row}
                  key={subject}
                  data-row=""
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span className={s.mark} aria-hidden="true" />

                  <span className={s.name}>
                    {subject}
                    <span className={s.blind} aria-hidden="true" />
                  </span>

                  <span className={s.leader} aria-hidden="true" />

                  <span className={s.level} aria-hidden="true">
                    {Array.from({ length: BARS }, (_, b) => (
                      <span
                        className={s.bar}
                        key={b}
                        style={{ '--b': b, '--rest': REST[b] } as React.CSSProperties}
                      />
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            {mediaStudy.summary ? (
              <p className={s.ticker}>
                <span className={s.tickerHatch} aria-hidden="true" />
                <span className={s.tickerText}>{mediaStudy.summary}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className={s.college}>
          <p className={s.collegeLead}>{mediaStudy.collegeLead}</p>

          <ul className={s.badges}>
            {mediaStudy.professions.map((name, i) => (
              <li className={s.slot} key={name} style={{ '--i': i } as React.CSSProperties}>
                <span className={s.hang}>
                  <span className={s.strap} aria-hidden="true" />
                  <span className={s.badge}>
                    <span className={s.punch} aria-hidden="true" />
                    <span className={s.badgeName}>{name}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
