'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { mediaProject } from '@/content/media';
import { asset } from '@/lib/asset';
import s from './media-project.module.css';

/**
 * Что даёт проект.
 *
 * Блок стоит на месте, пока идёт прокрутка: меняются только номер, кадр
 * и подсветка пункта справа, к которому этот кадр относится. Всё собрано
 * под один экран — ничего не уезжает и не переливается за край.
 *
 * Пункт выбирает сама прокрутка: положение страницы внутри блока делится
 * на пять частей. Считает это один проход в кадре отрисовки, поэтому
 * колесо мыши не тянет за собой перерисовку всего блока.
 *
 * Условия приёма вынесены под блок отдельной картой: это формальное
 * требование, а не возможность, и в удерживаемый экран оно не входит.
 */

/** Сколько экранов прокрутки уходит на один пункт после первого. */
const STEP_VH = 0.55;

export function MediaProject() {
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(0);

  const total = mediaProject.points.length;

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec || total < 2) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const rect = sec.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / span));
      const i = Math.min(total - 1, Math.max(0, Math.round(p * (total - 1))));
      setNear((prev) => (prev === i ? prev : i));
    };
    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };

    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [total]);

  return (
    <>
      <section
        className={s.section}
        ref={sectionRef}
        aria-labelledby="media-project-title"
        style={{ '--screens': 1 + (total - 1) * STEP_VH } as React.CSSProperties}
      >
        <div className={s.sticky}>
          <div className={s.inner}>
            <div className={s.side}>
              <h2 className={s.title} id="media-project-title">
                {mediaProject.title}
              </h2>
              <p className={s.lead}>{mediaProject.lead}</p>

              {/* Кадр к пункту, на котором сейчас глаз. Снимки лежат стопкой
                  и сменяют друг друга наплывом: место под них не прыгает,
                  меняются только прозрачность и масштаб. */}
              <div className={s.stage}>
                {mediaProject.photos.map((photo, i) => (
                  <Image
                    className={s.shot}
                    key={photo.src}
                    data-on={i === near ? 'true' : 'false'}
                    src={asset(photo.src)}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                  />
                ))}

                <span className={s.scrim} aria-hidden="true" />

                <p className={s.counter} aria-hidden="true">
                  <span className={s.counterNum} key={near}>
                    {String(near + 1).padStart(2, '0')}
                  </span>
                  <span className={s.counterAll}>из {String(total).padStart(2, '0')}</span>
                </p>
              </div>
            </div>

            <ol className={s.points}>
              {mediaProject.points.map((point, i) => (
                <li
                  className={s.point}
                  key={point}
                  data-on={i === near ? 'true' : 'false'}
                >
                  <span className={s.rail} aria-hidden="true" />
                  <span className={s.num} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className={s.text}>{point}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className={s.tail}>
        <p className={s.admission}>{mediaProject.admission}</p>
      </div>
    </>
  );
}
