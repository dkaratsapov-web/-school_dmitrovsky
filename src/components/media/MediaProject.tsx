'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { mediaProject } from '@/content/media';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './media-project.module.css';

/**
 * Что даёт проект.
 *
 * Пункты длинные, читать их сеткой карточек тяжело, поэтому они идут
 * колонкой, а слева стоит крупный счётчик: он показывает, на каком
 * пункте сейчас глаз и сколько всего. Счётчик меняется от прокрутки —
 * это не украшение, а место в длинном тексте.
 *
 * Условия приёма вынесены отдельной картой в конце: это формальное
 * требование, а не возможность.
 */
export function MediaProject() {
  const listRef = useRef<HTMLOListElement>(null);
  const [near, setNear] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-point]'));
    const showAll = () => items.forEach((el) => el.setAttribute('data-in', 'true'));

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      showAll();
      return;
    }

    /* появление пунктов */
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', 'true');
          reveal.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );

    /* какой пункт сейчас в середине экрана — его номер и показывает счётчик */
    const track = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = items.indexOf(e.target as HTMLElement);
          if (i >= 0) setNear(i);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    items.forEach((el) => {
      reveal.observe(el);
      track.observe(el);
    });

    const safety = window.setTimeout(showAll, 2500);
    return () => {
      reveal.disconnect();
      track.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  const total = mediaProject.points.length;

  return (
    <section className={s.section} aria-labelledby="media-project-title">
      <div className={s.inner}>
        <div className={s.side}>
          <h2 className={s.title} id="media-project-title">
            {mediaProject.title}
          </h2>
          <p className={s.lead}>{mediaProject.lead}</p>

          <p className={s.counter} aria-hidden="true">
            <span className={s.counterNum} key={near}>
              {String(near + 1).padStart(2, '0')}
            </span>
            <span className={s.counterAll}>из {String(total).padStart(2, '0')}</span>
          </p>

          {/* Кадр к пункту, на котором сейчас глаз. Снимки лежат стопкой
              и сменяют друг друга наплывом: место под них не прыгает,
              а меняется только прозрачность и масштаб. */}
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
          </div>
        </div>

        <ol className={s.points} ref={listRef}>
          {mediaProject.points.map((point, i) => (
            <li
              className={[s.point, i === near ? s.pointNear : ''].filter(Boolean).join(' ')}
              key={point}
              data-point=""
            >
              <span className={s.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className={s.text}>{point}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className={s.inner}>
        <p className={s.admission}>{mediaProject.admission}</p>
      </div>
    </section>
  );
}
