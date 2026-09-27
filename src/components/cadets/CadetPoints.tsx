'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Count } from '../ui/Count';
import { cadetPointsFull, cadetPointsTitle } from '@/content/cadets';
import { asset } from '@/lib/asset';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './cadet-points.module.css';

/* Раскладка. Плитка тяжелее там, где тяжелее пункт: длинный текст —
   шире, снимок — выше, полный день — заливкой. Номера — позиции в списке
   направлений, порядок которого задан школой и не меняется. */
const PHOTO_WIDE = new Set([4]); // турклуб: байдарка ложится только вширь
const PHOTO_TALL = new Set([0, 2, 6]); // знамя, ГТО, мемориал — почти квадрат
const WIDE = new Set([1, 11]); // полный день и «без гаджетов»
const ACCENT = 1;

/** Полоса школьного дня: дочерчивается, когда плитка появилась. */
function DayLine() {
  return (
    <span className={s.day} aria-hidden="true">
      <span className={s.dayMark}>8:00</span>
      <span className={s.dayRail}>
        <span className={s.dayFill} />
      </span>
      <span className={s.dayMark}>19.30</span>
    </span>
  );
}

/**
 * Что входит в проект — двенадцать направлений неровной сеткой.
 *
 * Не двенадцать одинаковых карточек: там, где у школы есть снимок,
 * плитка становится кадром с подписью поверх; длинные пункты занимают
 * две колонки; полный день выделен заливкой и полосой от 8:00 до 19.30.
 * Вес плитки отвечает весу пункта, а не его номеру в списке.
 *
 * Появляются по мере попадания в окно, волной по диагонали. Без скрипта
 * видны сразу — ничего не прячется в ожидании наблюдателя.
 */
export function CadetPoints() {
  const sectionRef = useScrollProgressVar<HTMLElement>('--p');
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
    <section className={s.section} ref={sectionRef} aria-labelledby="cadet-points-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 className={s.title} id="cadet-points-title">
            {cadetPointsTitle}
          </h2>
          <p className={s.count}>
            <span className={s.countValue}>
              <Count to={cadetPointsFull.length} />
            </span>
            <span className={s.countWord}>направлений</span>
          </p>
        </div>

        <ul className={s.list} ref={listRef}>
          {cadetPointsFull.map((point, i) => {
            const photo = point.photo;
            const className = [
              s.point,
              photo ? s.shot : '',
              PHOTO_WIDE.has(i) ? s.shotWide : '',
              PHOTO_TALL.has(i) ? s.shotTall : '',
              WIDE.has(i) ? s.wide : '',
              i === ACCENT ? s.accent : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li
                className={className}
                key={point.title}
                data-point=""
                /* задержка = столбец + ряд: плитки выходят волной наискось */
                style={{ '--d': (i % 3) + Math.floor(i / 3) } as React.CSSProperties}
              >
                {photo ? (
                  <>
                    <Image
                      className={s.photo}
                      src={asset(photo.src)}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(min-width: 1280px) 33vw, (min-width: 620px) 50vw, 92vw"
                    />
                    <span className={s.veil} aria-hidden="true" />
                  </>
                ) : (
                  <span className={s.mark} aria-hidden="true" />
                )}

                <span className={s.body}>
                  <span className={s.pointTitle}>{point.title}</span>
                  {point.text ? <span className={s.pointText}>{point.text}</span> : null}
                  {i === ACCENT ? <DayLine /> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
