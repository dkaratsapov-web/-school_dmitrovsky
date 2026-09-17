'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { cadetHref, cadetLead, cadetPoints, cadetPrice, cadetShots, cadetText } from '@/content/cadets';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './cadet-corps.module.css';

/** Скорость каждого снимка в стопке: разная, отсюда глубина. */
const DEPTH = [0.12, -0.22, 0.3];

/**
 * Кадетский корпус — отдельный крупный блок.
 *
 * Слева рассказ о проекте, справа стопка снимков: строй, занятие, поход.
 * Снимки идут с разной скоростью относительно прокрутки, поэтому стопка
 * живёт как объёмная, а не как три картинки в ряд. Это фоновые слои,
 * текст неподвижен.
 *
 * Под рассказом — преимущества проекта. Вдоль них сверху вниз чертится
 * строевая линия, по которой идёт метка: чем дальше прокручен блок,
 * тем ниже она опустилась. Пункты проявляются по очереди, но остаются
 * видимыми и без скрипта.
 */
export function CadetCorps() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = r.height + window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / span));
      el.style.setProperty('--sp', p.toFixed(4));
    };
    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={s.section} ref={ref} aria-labelledby="cadets-title">
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.words}>
            <h2 id="cadets-title" className={s.title}>
              Проект «Кадетский корпус»
            </h2>
            <p className={s.lead}>{cadetLead}</p>
            <p className={s.text}>{cadetText}</p>

            <p className={s.price}>
              <span className={s.priceLabel}>{cadetPrice.label}</span>
              <span className={s.priceValue}>{cadetPrice.value}</span>
              <span className={s.priceNote}>{cadetPrice.note}</span>
            </p>

            <Link className={s.more} href={cadetHref}>
              <span className={s.moreLabel}>О проекте и правилах приёма</span>
              <span className={s.moreRule} aria-hidden="true" />
            </Link>
          </div>

          <div className={s.stack}>
            {cadetShots.map((shot, i) => (
              <span
                className={s.shot}
                key={shot.src}
                style={{ '--d': DEPTH[i] ?? 0, '--i': i } as React.CSSProperties}
              >
                <Image
                  className={s.photo}
                  src={asset(shot.src)}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                />
              </span>
            ))}
          </div>
        </div>

        <div className={s.points}>
          {/* строевая линия с бегущей меткой */}
          <span className={s.line} aria-hidden="true">
            <span className={s.lineFill} />
            <span className={s.lineMark} />
          </span>

          <ul className={s.list}>
            {cadetPoints.map((p, i) => (
              <li className={s.item} key={p.title} style={{ '--i': i } as React.CSSProperties}>
                <span className={s.rank}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.itemBody}>
                  <span className={s.itemTitle}>{p.title}</span>
                  <span className={s.itemText}>{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
