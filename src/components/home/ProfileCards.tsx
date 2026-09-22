'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { InfoBody } from '../ui/InfoBody';
import { profiles, profilesLead } from '@/content/profiles';
import type { Profile } from '@/content/profiles';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './profile-cards.module.css';

/**
 * Наклон и запаздывание каждой карточки. Значения разные, но не случайные:
 * ряд читается как разложенные на столе снимки, а не как ровная сетка.
 */
const POSE: readonly { tilt: number; lag: number }[] = [
  { tilt: -1.6, lag: 1 },
  { tilt: 1.1, lag: 0.35 },
  { tilt: -0.8, lag: 0.8 },
  { tilt: 1.5, lag: 0.15 },
];

/**
 * Профили 10 - 11 классов — четыре снимка, разложенные на столе.
 *
 * Все четыре видны сразу, прокрутки внутри блока нет. Карточки стоят
 * под разными углами и слегка находят друг на друга; снимок приглушён
 * фирменным синим и оживает в цвете под курсором, карточка при этом
 * выпрямляется и выходит вперёд.
 *
 * По мере прохода блока через окно карточки расходятся по вертикали
 * с разной скоростью — ряд «дышит» вместе с прокруткой. Двигаются
 * только transform и opacity, пересчёта вёрстки нет.
 */
export function ProfileCards() {
  const ref = useRef<HTMLElement>(null);
  /* Профиль раскрывается окном: главная работает как лендинг. */
  const [open, setOpen] = useState<Profile | null>(null);

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
    <section className={s.section} id="profiles" ref={ref} aria-labelledby="profiles-title">
      <div className={s.inner}>
        <h2 id="profiles-title" className={s.title}>
          Профильные 10 - 11 классы
        </h2>
        <p className={s.lead}>{profilesLead}</p>

        <ul className={s.row}>
          {profiles.map((p, i) => {
            const pose = POSE[i] ?? POSE[POSE.length - 1]!;
            return (
              <li
                className={s.card}
                key={p.name}
                style={
                  {
                    '--tilt': `${pose.tilt}deg`,
                    '--lag': pose.lag,
                    '--i': i,
                  } as React.CSSProperties
                }
              >
                <button className={s.link} type="button" onClick={() => setOpen(p)}>
                  <span className={s.shot}>
                    <Image
                      className={s.photo}
                      src={asset(p.image.src)}
                      alt={p.image.alt}
                      width={p.image.width}
                      height={p.image.height}
                      sizes="(min-width: 1200px) 400px, (min-width: 640px) 44vw, 88vw"
                    />
                    <span className={s.shade} aria-hidden="true" />
                    <span className={s.name}>
                      {p.name}
                      <span className={s.rule} aria-hidden="true" />
                    </span>
                  </span>

                  <span className={s.body}>
                    <span className={s.block}>
                      <span className={s.label}>Углублённое изучение</span>
                      <span className={s.marks}>
                        {p.subjects
                          .split(';')
                          .map((part) => part.trim())
                          .filter(Boolean)
                          .map((part) => (
                            <span className={s.mark} key={part}>
                              {part}
                            </span>
                          ))}
                      </span>
                    </span>
                    <span className={s.block}>
                      <span className={s.label}>Профессия в колледже</span>
                      <span className={s.text}>
                        {/* сами профессии выделены цветом: слова те же,
                            меняется только начертание */}
                        {p.college.slice(0, p.college.indexOf(':') + 1)}{' '}
                        <span className={s.prof}>
                          {p.college.slice(p.college.indexOf(':') + 1).trim()}
                        </span>
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <CallbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.name ?? ''}
        text={profilesLead}
        size="lg"
      >
        <InfoBody
          {...(open?.image ? { image: open.image } : {})}
          {...(open
            ? {
                points: open.subjects
                  .split(';')
                  .map((part) => part.trim())
                  .filter(Boolean),
                facts: [{ label: 'Профессия в колледже', value: open.college.slice(open.college.indexOf(':') + 1).trim() }],
              }
            : {})}
        />
      </CallbackModal>
    </section>
  );
}
