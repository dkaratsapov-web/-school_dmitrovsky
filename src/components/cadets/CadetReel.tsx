'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cadetReel, cadetReelTitle, cadetVideo } from '@/content/cadets';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './cadet-reel.module.css';

/* Геометрия колеса. Карточка меряется от сцены, всё остальное — от карточки,
   поэтому на узком экране колесо уменьшается целиком, а не болтается
   маленькой карточкой на огромном барабане. */
const CARD_H = 0.38; // высота передней карточки, доля высоты сцены
const CARD_MAX_W = 0.34; // но не шире этой доли ширины сцены
const CARD_MAX_W_NARROW = 0.78; // на телефоне ограничение другое
const NARROW = 900;
const CARD_RATIO = 1.45; // ширина карточки к высоте
const STEP = 40; // градусов между кадрами на барабане
const DRUM = 2.22; // радиус барабана, в высотах карточки — и всё ниже тоже
const LENS = 2.7; // расстояние до точки схода
const RING_R = 0.9; // радиус кольца
const RING_R_NARROW = 0.7; // на телефоне кольцо теснее, иначе не влезает
/* Барабан сам по себе вешает кадры на отвес. Это не отвес: лента уходит
   по дуге, центр которой смещён влево, поэтому кадр впереди стоит в ближней
   точке дуги — ровно по центру, — а соседние уже отъехали влево вместе
   с подъёмом и спуском. BOW — радиус этой дуги. */
const BOW = 1.82;
/* Дальше этого кадр стоит ребром, а ещё дальше — сваливается в точку схода. */
const CULL = 1.6;

/* Сколько экрана прокрутки уходит на раскрытие кольца и на один кадр. */
const RING_VH = 0.5;
const STEP_VH = 0.36;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Насколько влево увело кадр, повёрнутый на drumDeg. У переднего — ноль. */
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)));

/**
 * Оба состояния одной цепочкой: слагаемые кольца сходят на нет по мере
 * раскрытия, слагаемые барабана до раскрытия равны нулю. Дуга применяется
 * первой, в плоскости самого колеса, поэтому она сдвигает кадр вбок,
 * а не поворачивается вместе с ним.
 */
function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

type Stage = { w: number; h: number };

/**
 * Лента кадров — второй блок страницы проекта.
 *
 * В покое кадры стоят кольцом вокруг названия блока. Первое движение
 * прокрутки раскрывает кольцо в вертикальный барабан: кадр впереди лежит
 * плашмя во весь размер, соседние уходят в перспективу и сбегают за верх
 * и низ экрана. Дальше барабан подаёт вперёд следующий кадр.
 *
 * Всё колесо — одно число: 0 — кольцо, 1 — барабан с первым кадром впереди,
 * каждое следующее целое — ещё один повёрнутый кадр. Считает его один проход
 * в кадре отрисовки, который пишет трансформации прямо в DOM, поэтому
 * поворот колеса не перерисовывает React.
 *
 * Колесо крутит сама страница: прокрутку мы не перехватываем — на школьном
 * сайте человека нельзя запирать в блоке. Список справа — навигация:
 * нажатие подводит нужный кадр. При выключенной анимации и без скрипта
 * блок остаётся сеткой кадров.
 */
export function CadetReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [live, setLive] = useState(false);
  const [stage, setStage] = useState<Stage>({ w: 0, h: 0 });
  const [active, setActive] = useState(0);
  const [film, setFilm] = useState(false);

  const count = cadetReel.length;
  const last = Math.max(count - 1, 0);

  /* Движение включается после отрисовки: на сервере нет ни matchMedia,
     ни размеров сцены, а при выключенной анимации колеса нет вовсе. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setTimeout(() => setLive(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !live) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    const id = window.setTimeout(read, 0);
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => {
      window.clearTimeout(id);
      ro.disconnect();
    };
  }, [live]);

  /* Один проход на кадр отрисовки: положение колеса берём из прокрутки
     страницы и пишем трансформации. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!live || !section || stage.h === 0) return;

    const cardW = Math.min(
      stage.h * CARD_H * CARD_RATIO,
      stage.w * (stage.w < NARROW ? CARD_MAX_W_NARROW : CARD_MAX_W),
    );
    const cardH = cardW / CARD_RATIO;
    const narrow = stage.w < NARROW;
    const ringR = cardH * (narrow ? RING_R_NARROW : RING_R);
    const drumR = cardH * DRUM;
    const bow = cardH * BOW;
    /* кадры в кольце ужимаются, пока круг не начнёт читаться кольцом,
       а не бусинами на нитке */
    const ringScale = clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1);

    /* размеры карточек и точка схода — в DOM: в разметке их нет, поэтому
       без скрипта блок остаётся обычной сеткой кадров */
    const el = stageRef.current;
    if (el) el.style.perspective = `${cardH * LENS}px`;
    cardRefs.current.forEach((card, i) => {
      const f = cadetReel[i];
      if (!card || !f) return;
      /* высота у всех одна — её держит геометрия колеса, — а ширину
         задаёт сам снимок: кадр в рост, кадр поперёк, кадр квадратом.
         Так ничего не обрезается и не стоит в чёрной рамке. */
      const w = Math.min(cardH * (f.width / f.height), cardW * 1.16);
      card.style.width = `${w}px`;
      card.style.height = `${cardH}px`;
      card.style.marginLeft = `${-w / 2}px`;
      card.style.marginTop = `${-cardH / 2}px`;
    });

    let frame = 0;
    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const ringPx = vh * RING_VH;
      const stepPx = vh * STEP_VH;
      const scrolled = clamp(-rect.top, 0, ringPx + last * stepPx);
      const t = scrolled <= ringPx ? scrolled / ringPx : 1 + (scrolled - ringPx) / stepPx;

      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      /* барабан отодвинут назад, чтобы его передняя грань легла на плоскость
         картинки: без этого кольцо оказалось бы у дальней стенки перспективы */
      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;

      const near = clamp(Math.round(pos), 0, last);
      for (let i = 0; i < count; i += 1) {
        const d = i - pos;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m);
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? '0' : '1';
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
          const front = m > 0.9 && i === near;
          card.dataset.front = front ? 'true' : 'false';
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      setActive((prev) => (prev === near ? prev : near));
    };

    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [live, stage, count, last]);

  /* Нажатие в списке подводит кадр: страница прокручивается к его месту,
     колесо поворачивается само — своего состояния у него нет. */
  const to = useCallback(
    (i: number) => {
      const section = sectionRef.current;
      if (!section || !live) return;
      const vh = window.innerHeight;
      const top = section.offsetTop + vh * RING_VH + i * vh * STEP_VH;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [live],
  );

  /* Фильм со звуком и речью: открывается окном по нажатию. */
  useEffect(() => {
    const el = filmRef.current;
    if (!el) return;
    if (film && !el.open) {
      el.showModal();
      void videoRef.current?.play().catch(() => {
        /* браузер отказал в запуске — человек нажмёт на кнопку плеера */
      });
    }
    if (!film && el.open) {
      videoRef.current?.pause();
      el.close();
    }
  }, [film]);

  return (
    <section
      className={s.section}
      ref={sectionRef}
      data-live={live ? 'true' : 'false'}
      aria-labelledby="cadet-reel-title"
      style={
        live
          ? ({ height: `calc(100svh * ${1 + RING_VH + last * STEP_VH})` } as React.CSSProperties)
          : undefined
      }
    >
      <div className={s.sticky}>
        <div className={s.stage} ref={stageRef} data-live={live ? 'true' : 'false'}>
          <div className={s.wheel} ref={wheelRef}>
            {cadetReel.map((f, i) => (
              <div
                className={s.card}
                key={f.src}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
              >
                <span className={s.face}>
                  <Image
                    className={s.shot}
                    src={asset(f.src)}
                    alt={f.alt}
                    width={f.width}
                    height={f.height}
                    draggable={false}
                    sizes="(min-width: 1024px) 50vw, 90vw"
                  />

                  {f.kind === 'film' ? (
                    <button className={s.play} type="button" onClick={() => setFilm(true)}>
                      <span className={s.playMark} aria-hidden="true" />
                      <span className={s.playWord}>Смотреть фильм о корпусе</span>
                    </button>
                  ) : null}

                  <span className={s.cardCaption}>{f.caption}</span>
                </span>
              </div>
            ))}
          </div>

          {/* название блока стоит в середине кольца и уступает место
              подписи кадра, когда кольцо раскрылось в барабан */}
          <h2 className={s.label} id="cadet-reel-title" ref={labelRef}>
            {cadetReelTitle}
          </h2>

          <div className={s.front} ref={titleRef} aria-hidden="true">
            <span className={s.frontNum}>{String(active + 1).padStart(2, '0')}</span>
            <span className={s.frontWord}>{cadetReel[active]?.caption}</span>
          </div>

          <ol className={s.index} aria-label="Кадры">
            {cadetReel.map((f, i) => (
              <li key={f.src}>
                <button
                  className={[s.indexItem, i === active ? s.indexOn : ''].filter(Boolean).join(' ')}
                  type="button"
                  onClick={() => to(i)}
                  aria-current={i === active ? 'true' : undefined}
                >
                  {f.caption}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <dialog className={s.window} ref={filmRef} onClose={() => setFilm(false)} aria-label="Фильм о кадетском корпусе">
        <video
          className={s.windowClip}
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={asset(cadetVideo.poster)}
        >
          <source src={asset(cadetVideo.webm)} type="video/webm" />
          <source src={asset(cadetVideo.mp4)} type="video/mp4" />
        </video>

        <button className={s.windowClose} type="button" aria-label="Закрыть" onClick={() => setFilm(false)}>
          <span className={s.windowBar} />
          <span className={s.windowBar} />
        </button>
      </dialog>
    </section>
  );
}
