'use client';

import { useEffect, useId, useRef } from 'react';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './study-block.module.css';

/** Что изучают на профиле: у каждого направления своё, разбор блока один. */
export type Study = {
  title: string;
  lead: string;
  subjects: readonly string[];
  /** Итог под списком — не предмет, поэтому идёт отдельной строкой. */
  summary: string | null;
  collegeLead: string;
  professions: readonly string[];
};

/**
 * Углублённое изучение — показания на мониторе.
 *
 * Блок общий для страниц профильных классов: разбор один, меняется только
 * наполнение. Слева — приглашение школы, справа — монитор: предметы идут
 * строками, у каждой справа индикатор уровня. Пока строка проходит
 * середину экрана, её индикатор живой; остальные лежат ровной линией.
 * Движение привязано к чтению, а не разложено одинаково по всем карточкам.
 *
 * Строка про комплексную подготовку к ЕГЭ идёт бегущей строкой под списком:
 * это не ещё один предмет, а вывод по всем. Слова перенесены как есть.
 *
 * Ниже — программа колледжа: профессии висят аккредитационными бейджами
 * на рейке и качаются, каждый в своей фазе.
 */

/** Школьный знак на бейдже: атом с орбитами, как на гербе. */
function Atom() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <ellipse cx="12" cy="12" rx="10.4" ry="4.5" transform="rotate(-28 12 12)" />
      <ellipse cx="12" cy="12" rx="10.4" ry="4.5" transform="rotate(28 12 12)" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}

/** Полос в индикаторе уровня. */
const BARS = 9;

/**
 * Подсвеченные клетки: сколько клеток от левого края контейнера, сколько
 * сверху и через сколько секунд загорается. Разброс подобран так, чтобы
 * они не выстраивались в ряд и не попадали под длинные строки.
 */
const CELLS: readonly [number, number, number][] = [
  [3, 6, 0],
  [7, 14, 2.6],
  [4, 21, 5.2],
  [11, 3, 7.4],
  [2, 27, 3.8],
  [9, 24, 6.1],
];

/** Высоты полос в покое, доля от полной: ровная линия с лёгкой неровностью. */
const REST = [0.16, 0.1, 0.2, 0.12, 0.24, 0.12, 0.18, 0.1, 0.14];

export function StudyBlock({ study }: { study: Study }) {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const titleId = useId();

  /* Столбцов ровно столько, сколько бейджей: у разных профилей их разное
     число, и пустой столбец оставлял рейку висеть в воздухе. Имя длиннее
     сорока четырёх знаков на телефоне занимает весь ряд: в половине
     экрана оно рассыпается по одному слову в строку. Имена покороче
     по-прежнему идут парами. */
  const cols = Math.min(4, study.professions.length);
  const longest = study.professions.reduce((n, name) => Math.max(n, name.length), 0);
  const colsSmall = longest > 44 ? 1 : Math.min(2, study.professions.length);
  /* Переменная держит всю раскладку целиком: число столбцов внутри repeat()
     из переменной браузер не принимает — вся запись становится негодной,
     и сетка рассыпается в один столбец. */
  const track = `repeat(${cols}, minmax(0, 1fr))`;
  const trackSmall = `repeat(${colsSmall}, minmax(0, 1fr))`;
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
    <section className={s.section} ref={ref} aria-labelledby={titleId}>
      {/* Фон — страница в клетку: сама клетка, поле на две клетки от края
          и перелив, который медленно ходит по бумаге. Несколько клеток
          подсвечиваются по очереди — бумага не стоит мёртвой. */}
      <span className={s.backdrop} aria-hidden="true">
        <span className={s.paper} />
        <span className={s.wash} />
        <span className={s.sheen} />

        <span className={s.marks}>
          {CELLS.map(([x, y, d], i) => (
            <span
              className={s.cell}
              key={i}
              style={{ '--x': x, '--y': y, '--d': `${d}s` } as React.CSSProperties}
            />
          ))}
        </span>

        <span className={s.rule} />
      </span>

      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.head}>
            <h2 className={s.title} id={titleId}>
              {study.title}
            </h2>
            <p className={s.lead}>{study.lead}</p>
          </div>

          {/* монитор аппаратной: сетка вещания */}
          <div className={s.monitor}>
            <span className={s.scan} aria-hidden="true" />
            <span className={s.sheen} aria-hidden="true" />

            <ul className={s.list} ref={listRef}>
              {study.subjects.map((subject, i) => (
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

            {study.summary ? (
              <p className={s.ticker}>
                <span className={s.tickerHatch} aria-hidden="true" />
                <span className={s.tickerText}>{study.summary}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className={s.college}>
          <p className={s.collegeLead}>{study.collegeLead}</p>

          <ul
            className={s.badges}
            style={{ '--track': track, '--track-sm': trackSmall } as React.CSSProperties}
          >
            {study.professions.map((name, i) => (
              <li className={s.slot} key={name} style={{ '--i': i } as React.CSSProperties}>
                <span className={s.hang}>
                  <span className={s.strap} aria-hidden="true" />
                  <span className={s.clip} aria-hidden="true" />

                  <span className={s.badge}>
                    <span className={s.punch} aria-hidden="true" />

                    <span className={s.crest} aria-hidden="true">
                      <Atom />
                    </span>

                    <span className={s.badgeName}>{name}</span>
                    <span className={s.badgeRule} aria-hidden="true" />
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
