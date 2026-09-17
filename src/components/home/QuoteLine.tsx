'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import s from './quote-line.module.css';

const QUOTE = 'Тяжело в учении — легко в бою';
const AUTHOR = 'Александр Васильевич Суворов';

/** Пауза между буквами, мс. */
const STEP = 55;

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/* Печатать можно там, где есть скрипт, наблюдатель и не выключено движение.
   Иначе строка просто показана целиком. */
function canType(): boolean {
  return typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion();
}

/**
 * Цитата, которая печатается по букве.
 *
 * Строка набирается рукописным начертанием, буква за буквой, как пером;
 * за последней буквой мигает перо-курсор, пока строка не дописана.
 * Ниже — подпись автора.
 *
 * Без скрипта строка видна целиком: печать включается только тогда,
 * когда скрипт есть и движение не выключено в системе.
 */
export function QuoteLine() {
  const ref = useRef<HTMLElement>(null);
  const typing = useSyncExternalStore(subscribeMotion, canType, () => false);
  const [typed, setTyped] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || !typing || typed >= QUOTE.length) return;
    const id = window.setTimeout(() => setTyped((n) => n + 1), STEP);
    return () => window.clearTimeout(id);
  }, [started, typing, typed]);

  /* До гидратации, без скрипта и при выключенном движении — строка целиком. */
  const shown = typing ? QUOTE.slice(0, typed) : QUOTE;
  const done = !typing || typed >= QUOTE.length;

  return (
    <section className={s.section} ref={ref} aria-label="Цитата">
      <div className={s.inner}>
        <figure className={s.figure}>
          <blockquote className={s.quote}>
            <span className="visually-hidden">{QUOTE}</span>
            {/* Невидимая копия держит ширину строки: набранные буквы
                стоят на месте, а печать идёт вправо, а не растягивает
                строку от середины. */}
            <span className={s.holder} aria-hidden="true">
              <span className={s.ghost}>{QUOTE}</span>
              <span className={s.typed}>
                {shown}
                <span className={[s.pen, done ? s.penOff : ''].filter(Boolean).join(' ')} />
              </span>
            </span>
          </blockquote>

          <figcaption className={s.author}>
            <span className={s.rule} aria-hidden="true" />
            {AUTHOR}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
