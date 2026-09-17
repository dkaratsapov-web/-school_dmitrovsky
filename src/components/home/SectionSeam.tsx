'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import s from './section-seam.module.css';

/**
 * Стык двух блоков: тёмный переходит в светлый не срезом, а куполом.
 *
 * Купол поднимается по мере прокрутки, а сквозь стык проходит орбита
 * атома — тот же мотив, что в знаке школы и в ленте с цифрами. Слои
 * декоративные, текста в них нет, поэтому параллакс здесь допустим.
 *
 * Без скрипта купол стоит в конечном положении: стык выглядит целым.
 */
export function SectionSeam() {
  const ref = useRef<HTMLDivElement>(null);

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
    <div className={s.seam} ref={ref} aria-hidden="true">
      <span className={s.dome} />
      <svg className={s.orbit} viewBox="0 0 600 240" preserveAspectRatio="none">
        <ellipse cx="300" cy="120" rx="292" ry="104" />
      </svg>
      <svg className={s.orbitTwo} viewBox="0 0 600 240" preserveAspectRatio="none">
        <ellipse cx="300" cy="120" rx="240" ry="86" />
      </svg>
      <span className={s.nucleus} />
    </div>
  );
}
