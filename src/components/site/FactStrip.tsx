'use client';

import { Fragment, useEffect, useRef } from 'react';
import { facts } from '@/content/facts';
import { prefersReducedMotion } from '@/lib/motion';
import s from './fact-strip.module.css';

/** Сколько раз повторить набор в одной половине ленты. */
const REPEAT = 3;

/** Знак школы — разделитель между цифрами: ядро и две орбиты. */
function AtomMark() {
  return (
    <svg className={s.atom} viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10.2" ry="4.4" transform="rotate(-28 12 12)" />
      <ellipse cx="12" cy="12" rx="10.2" ry="4.4" transform="rotate(28 12 12)" />
      <circle className={s.core} cx="12" cy="12" r="2.4" />
    </svg>
  );
}

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={s.list} aria-hidden={hidden ? 'true' : undefined}>
      {Array.from({ length: REPEAT }).flatMap((_, r) =>
        facts.map((f) => (
          <Fragment key={`${r}-${f.value}-${f.label}`}>
            <li className={s.item}>
              <span className={s.value}>{f.value}</span>
              <span className={s.label}>{f.label}</span>
            </li>
            {/* знак стоит отдельным звеном, поэтому приходится ровно
                на середину промежутка между соседними цифрами */}
            <li className={s.sep} aria-hidden="true">
              <AtomMark />
            </li>
          </Fragment>
        )),
      )}
    </ul>
  );
}

/**
 * Тонкая лента с цифрами сразу под первым экраном.
 *
 * Не полноценный раздел: ни заголовка, ни отступов секции — узкая полоса
 * на стыке с героем. Сама по себе едет слева направо средствами CSS,
 * поэтому без JavaScript лента остаётся видимой и живой.
 *
 * Прокрутка страницы добавляет к ней наклон и сдвиг: чем быстрее крутят,
 * тем сильнее лента «отстаёт». Это единственное, что делает здесь
 * скрипт — движение работает и без него.
 */
export function FactStrip() {
  const leanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = leanRef.current;
    if (!el || prefersReducedMotion()) return;

    let last = window.scrollY;
    let vel = 0;
    let frame = 0;

    const tick = () => {
      frame = 0;
      const y = window.scrollY;
      /* скорость прокрутки, ограниченная и сглаженная */
      const raw = Math.max(-1, Math.min(1, (y - last) / 28));
      last = y;
      vel += (raw - vel) * 0.18;
      el.style.setProperty('--vel', vel.toFixed(3));
      if (Math.abs(vel) > 0.002) frame = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <aside className={s.strip} aria-label="Школа в цифрах">
      <div className={s.lean} ref={leanRef}>
        <div className={s.marquee}>
          <Track />
          <Track hidden />
        </div>
      </div>
    </aside>
  );
}
