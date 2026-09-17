'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import s from './quote-line.module.css';

const QUOTE = 'Тяжело в учении — легко в бою';
const AUTHOR = 'Александр Васильевич Суворов';

/** Общее начало правильной строки и оговорки. */
const STEM = 'Тяжело в учении — ';
/** Оговорка: сперва пишется противоположное слово, потом стирается. */
const SLIP = `${STEM}тяжело`;

/** Пауза между буквами при наборе, мс. */
const STEP = 58;
/** Стирание идёт быстрее набора. */
const ERASE = 34;
/** Заминка перед тем, как заметить ошибку, мс. */
const NOTICE = 620;
/** Пауза после стирания, перед правильным словом. */
const RESUME = 260;

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
 * Строка набирается рукописным начертанием, буква за буквой, как пером.
 * По дороге рука ошибается — пишет «тяжело в бою», — слово стирается
 * и дописывается верное. Курсор мигает и после того, как строка
 * дописана. Ниже — подпись автора.
 *
 * Без скрипта строка видна целиком: печать включается только тогда,
 * когда скрипт есть и движение не выключено в системе.
 */
export function QuoteLine() {
  const ref = useRef<HTMLElement>(null);
  const typing = useSyncExternalStore(subscribeMotion, canType, () => false);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);
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

  /* Набор с оговоркой: сперва пишется «тяжело в бою», потом слово
     стирается и дописывается верное. Каждый шаг — отдельный таймер,
     поэтому состояние меняется в обработчике, а не в теле эффекта. */
  useEffect(() => {
    if (!started || !typing) return;

    if (phase === 0) {
      if (text.length < SLIP.length) {
        const id = window.setTimeout(() => setText(SLIP.slice(0, text.length + 1)), STEP);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setPhase(1), NOTICE);
      return () => window.clearTimeout(id);
    }

    if (phase === 1) {
      if (text.length > STEM.length) {
        const id = window.setTimeout(() => setText(text.slice(0, -1)), ERASE);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setPhase(2), RESUME);
      return () => window.clearTimeout(id);
    }

    if (text.length < QUOTE.length) {
      const id = window.setTimeout(() => setText(QUOTE.slice(0, text.length + 1)), STEP);
      return () => window.clearTimeout(id);
    }

    return;
  }, [started, typing, phase, text]);

  /* До гидратации, без скрипта и при выключенном движении — строка целиком. */
  const shown = typing ? text : QUOTE;

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
                <span className={s.pen} />
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
