'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cadetReel, cadetReelTitle, cadetVideo } from '@/content/cadets';
import { asset } from '@/lib/asset';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './cadet-reel.module.css';

/**
 * Лента кадров — второй блок страницы проекта.
 *
 * Сделана не каруселью одинаковых плиток: у каждого кадра своя сторона,
 * и в ленте они стоят как на плёнке — кадр в рост, кадр поперёк, кадр
 * квадратом. Ничего не обрезается ради общей рамки.
 *
 * Лента едет родной прокруткой с привязкой к кадру: пальцем, колесом,
 * стрелками с клавиатуры и кнопками. Поэтому без скрипта она остаётся
 * рабочей — все кадры на месте и их можно листать.
 *
 * Движение: кадр, вставший к левой отбивке, выходит на полный свет,
 * остальные отступают вглубь; снимок внутри рамки идёт со своей
 * скоростью по мере прокрутки страницы. Подпись и счётчик сменяются
 * проворотом — одно движение на весь блок.
 */
export function CadetReel() {
  const sectionRef = useScrollProgressVar<HTMLElement>('--p');
  const railRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<(HTMLDivElement | null)[]>([]);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  /* фильм со звуком и речью: включается только по нажатию */
  const [filmOn, setFilmOn] = useState(false);

  /* Положение ленты: свет на кадрах, счётчик и полоса прогресса.
     Считается в кадре отрисовки, значения уходят в CSS-переменные. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const pad = Number.parseFloat(getComputedStyle(rail).paddingLeft) || 0;
      const gate = rail.scrollLeft + pad;
      const span = Math.max(1, rail.clientWidth);
      let near = 0;
      let best = Number.POSITIVE_INFINITY;

      framesRef.current.forEach((el, i) => {
        if (!el) return;
        const dist = Math.abs(el.offsetLeft - gate);
        if (dist < best) {
          best = dist;
          near = i;
        }
        el.style.setProperty('--k', Math.min(1, dist / span).toFixed(3));
      });

      const room = rail.scrollWidth - rail.clientWidth;
      const done = room > 0 ? rail.scrollLeft / room : 1;
      rail.closest<HTMLElement>('section')?.style.setProperty('--prog', done.toFixed(4));
      setActive((prev) => (prev === near ? prev : near));
    };
    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    request();
    rail.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      rail.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Фильм останавливается, когда его кадр ушёл из ленты: звук из-за
     края экрана — это то, чего человек не просил. */
  useEffect(() => {
    if (!filmOn || active === 0) return;
    filmRef.current?.pause();
  }, [filmOn, active]);

  const go = useCallback((to: number) => {
    const rail = railRef.current;
    const el = framesRef.current[to];
    if (!rail || !el) return;
    const pad = Number.parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    rail.scrollTo({
      left: el.offsetLeft - pad,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, []);

  const playFilm = () => {
    setFilmOn(true);
    go(0);
    /* элемент появится в следующей отрисовке — запускаем после неё */
    window.setTimeout(() => {
      void filmRef.current?.play().catch(() => {
        /* браузер отказал в запуске — человек нажмёт на кнопку плеера */
      });
    }, 0);
  };

  const total = cadetReel.length;

  return (
    <section className={s.section} ref={sectionRef} aria-labelledby="cadet-reel-title">
      <div className={s.head}>
        <h2 className={s.title} id="cadet-reel-title">
          {cadetReelTitle}
        </h2>

        <div className={s.tools}>
          <p className={s.counter} aria-hidden="true">
            <span className={s.roll} key={active}>
              {String(active + 1).padStart(2, '0')}
            </span>
            <span className={s.of}>из {total}</span>
          </p>

          <div className={s.buttons}>
            <button
              className={s.step}
              type="button"
              onClick={() => go(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Предыдущий кадр"
            >
              <Chevron back />
            </button>
            <button
              className={s.step}
              type="button"
              onClick={() => go(Math.min(total - 1, active + 1))}
              disabled={active === total - 1}
              aria-label="Следующий кадр"
            >
              <Chevron />
            </button>
          </div>
        </div>
      </div>

      <div
        className={s.rail}
        ref={railRef}
        tabIndex={0}
        role="group"
        aria-label={`Лента кадров: ${total} штук, листается вбок`}
      >
        {cadetReel.map((f, i) => (
          <div
            className={s.frame}
            key={f.src}
            ref={(el) => {
              framesRef.current[i] = el;
            }}
            style={{ '--ar': `${f.width} / ${f.height}` } as React.CSSProperties}
          >
            {f.kind === 'film' && filmOn ? (
              <video
                className={s.film}
                ref={filmRef}
                controls
                playsInline
                preload="none"
                poster={asset(cadetVideo.poster)}
              >
                <source src={asset(cadetVideo.webm)} type="video/webm" />
                <source src={asset(cadetVideo.mp4)} type="video/mp4" />
              </video>
            ) : (
              <>
                <Image
                  className={s.shot}
                  src={asset(f.src)}
                  alt={f.alt}
                  width={f.width}
                  height={f.height}
                  sizes="(min-width: 1024px) 50vw, 92vw"
                />

                {f.kind === 'film' ? (
                  <button className={s.play} type="button" onClick={playFilm}>
                    <span className={s.playMark} aria-hidden="true" />
                    <span className={s.playWord}>Смотреть фильм о корпусе</span>
                  </button>
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>

      <div className={s.foot}>
        <p className={s.caption} aria-hidden="true">
          <span className={s.roll} key={active}>
            {cadetReel[active]?.caption}
          </span>
        </p>

        <span className={s.bar} aria-hidden="true">
          <span className={s.barFill} />
        </span>
      </div>
    </section>
  );
}

/** Уголок на кнопках перелистывания: в тексте стрелок нет. */
function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        d={back ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
