'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cadetLead, cadetPoints, cadetPrice, cadetShots, cadetText, cadetVideo } from '@/content/cadets';
import { ConsultInline } from '../forms/ConsultInline';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './cadet-corps.module.css';

/** Скорость каждого слоя в стопке: разная, отсюда глубина. */
const DEPTH = [0.12, -0.22, 0.3];

/* Строй — верхний широкий слой, мемориал — квадратный справа. */
const [cadetMemorial, cadetField] = cadetShots;

/**
 * Кадетский корпус — отдельный крупный блок.
 *
 * Слева рассказ о проекте, справа стопка: строй на выездных занятиях,
 * пост у мемориала и ролик о проекте. Слои идут с разной скоростью
 * относительно прокрутки, поэтому
 * стопка живёт как объёмная, а не как три картинки в ряд. Это фоновые
 * слои, текст неподвижен.
 *
 * Ролик со звуком и речью, поэтому запускается по нажатию: фоновым
 * циклом такое не ставят.
 *
 * Под рассказом — преимущества проекта. Вдоль них сверху вниз чертится
 * строевая линия, по которой идёт метка: чем дальше прокручен блок,
 * тем ниже она опустилась. Пункты проявляются по очереди, но остаются
 * видимыми и без скрипта.
 */
export function CadetCorps() {
  const ref = useRef<HTMLElement>(null);
  /* Ролик со звуком и речью: играет по нажатию, а не сам. */
  const [playing, setPlaying] = useState(false);

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
    <section className={s.section} id="cadets" ref={ref} aria-labelledby="cadets-title">
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

            <ConsultInline
              title="Получить бесплатную консультацию"
              action="Получить консультацию"
            />
          </div>

          <div className={s.stack}>
            {/* Порядок слоёв: сначала снимки, ролик — нижним слоем.
                Первым в стопке идёт строй, ролик открывается под ним. */}
            <span className={s.shot} style={{ '--d': DEPTH[0], '--i': 0 } as React.CSSProperties}>
              <Image
                className={s.photo}
                src={asset(cadetField.src)}
                alt={cadetField.alt}
                width={cadetField.width}
                height={cadetField.height}
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </span>

            <span className={s.shot} style={{ '--d': DEPTH[1], '--i': 1 } as React.CSSProperties}>
              <Image
                className={s.photo}
                src={asset(cadetMemorial.src)}
                alt={cadetMemorial.alt}
                width={cadetMemorial.width}
                height={cadetMemorial.height}
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </span>

            <span className={s.shot} style={{ '--d': DEPTH[2], '--i': 2 } as React.CSSProperties}>
              {playing ? (
                <video
                  className={s.clip}
                  controls
                  autoPlay
                  playsInline
                  poster={asset(cadetVideo.poster)}
                  width={cadetVideo.width}
                  height={cadetVideo.height}
                >
                  <source src={asset(cadetVideo.webm)} type="video/webm" />
                  <source src={asset(cadetVideo.mp4)} type="video/mp4" />
                </video>
              ) : (
                <button className={s.play} type="button" onClick={() => setPlaying(true)}>
                  <Image
                    className={s.photo}
                    src={asset(cadetVideo.poster)}
                    alt=""
                    width={cadetVideo.width}
                    height={cadetVideo.height}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                  />
                  <span className={s.playMark} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 6.5l9 5.5-9 5.5z" />
                    </svg>
                  </span>
                  <span className={s.playLabel}>{cadetVideo.label}</span>
                </button>
              )}
            </span>
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
