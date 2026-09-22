'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import { useScrollProgressVar } from '@/lib/motion';
import { asset } from '@/lib/asset';
import s from './hero-video.module.css';

type Sources = { large: string; small: string; phone: string };

type Props = {
  /** Заголовок первого экрана. */
  title: string;
  /** Постер: виден сразу и остаётся, пока видео не готово. */
  poster: string;
  posterWidth?: number;
  posterHeight?: number;
  /** Видео школы: по две версии на каждый формат. */
  video?: { mp4: Sources; webm: Sources };
};

/** Ниже этой ширины хватает облегчённой версии. */
const LARGE_FROM = '(min-width: 1600px)';
/** А ниже этой — телефонной: 720 px вместо 1280 и втрое меньше веса. */
const SMALL_FROM = '(min-width: 768px)';

/* ------------------------------------------------------------------ */
/* Можно ли грузить видео: без экономии трафика и без reduce-motion.    */
/* Значение читается подпиской, а не состоянием в эффекте, иначе        */
/* react-hooks/set-state-in-effect справедливо ругается.                */

function subscribeMedia(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function readMedia(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  return conn?.saveData !== true;
}

/**
 * Первый экран: видео школы во всё окно под затемнением.
 *
 * Формат и размер выбирает сам браузер по списку <source>: лишний файл
 * не скачивается, а если webm не поддерживается (Safari), берётся mp4.
 * До первого кадра и при выключенном движении на месте видео постер.
 *
 * Слой с видео связан с прокруткой: медленно отъезжает и приближается.
 * Параллакс только на фоне, текст и форма неподвижны.
 */
export function HeroVideo({ title, poster, posterWidth, posterHeight, video }: Props) {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  /* Видео подключается не сразу: сначала страница должна показаться
     и освободить сеть. Без этого телефон тянул три мегабайта видео
     в тот же момент, когда грузил страницу. */
  const [armed, setArmed] = useState(false);
  const allowVideo = useSyncExternalStore(subscribeMedia, readMedia, () => false);

  useEffect(() => {
    if (!allowVideo) return;

    let timer = 0;
    type WithIdle = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const idle = (window as WithIdle).requestIdleCallback;

    const arm = () => {
      if (typeof idle === 'function') idle(() => setArmed(true), { timeout: 2500 });
      else timer = window.setTimeout(() => setArmed(true), 600);
    };

    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });

    return () => {
      window.removeEventListener('load', arm);
      if (timer) window.clearTimeout(timer);
    };
  }, [allowVideo]);

  /* Пока первый экран на странице, шапка знает, что под ней тёмный фон. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);

  /* Автозапуск разрешён только беззвучному видео, а свойство muted React
     в разметку не выносит — выставляем его сами до вызова play(). */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !allowVideo || !armed) return;

    v.muted = true;
    v.defaultMuted = true;

    const cleanups: Array<() => void> = [];

    const start = () => {
      v.play().catch(() => {
        /* браузер отказал в автозапуске — ждём первого касания страницы */
      });
    };

    /* Браузер сам начинает выбор источника, когда в пустое видео
       добавляют <source>. Свой load() поверх этого — вторая закачка
       того же файла, и вес страницы удваивается. */
    if (v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
    start();
    v.addEventListener('canplay', start);

    /* Постер убираем не по событию playing, а после реально отрисованного
       кадра: иначе при сбое декодера на месте видео остаётся пустота. */
    type WithFrameCb = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    const withFrame = v as WithFrameCb;
    const onFrame = () => setReady(true);
    if (typeof withFrame.requestVideoFrameCallback === 'function') {
      withFrame.requestVideoFrameCallback(onFrame);
    } else {
      const poll = () => {
        if (v.readyState >= 2 && v.currentTime > 0.05) onFrame();
      };
      v.addEventListener('timeupdate', poll);
      cleanups.push(() => v.removeEventListener('timeupdate', poll));
    }

    /* Запасной путь: если автозапуск всё же заблокирован, видео стартует
       от первого действия пользователя на странице. */
    const onFirstTouch = () => {
      if (v.paused) start();
    };
    window.addEventListener('pointerdown', onFirstTouch, { once: true });
    window.addEventListener('keydown', onFirstTouch, { once: true });

    return () => {
      v.removeEventListener('canplay', start);
      window.removeEventListener('pointerdown', onFirstTouch);
      window.removeEventListener('keydown', onFirstTouch);
      cleanups.forEach((fn) => fn());
    };
  }, [allowVideo, armed]);

  const words = title.split(' ');

  return (
    <section className={s.hero} ref={ref}>
      <div className={s.media} style={{ '--poster': `url(${poster})` } as React.CSSProperties}>
        <Image
          className={[s.plate, ready ? s.plateHidden : ''].filter(Boolean).join(' ')}
          src={poster}
          alt=""
          width={posterWidth ?? 1920}
          height={posterHeight ?? 1080}
          priority
          sizes="100vw"
        />

        <video
          ref={videoRef}
          className={[s.plate, ready ? '' : s.plateHidden].filter(Boolean).join(' ')}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          aria-hidden="true"
        >
          {allowVideo && armed && video ? (
            <>
              <source src={video.webm.large} type="video/webm" media={LARGE_FROM} />
              <source src={video.webm.small} type="video/webm" media={SMALL_FROM} />
              <source src={video.webm.phone} type="video/webm" />
              <source src={video.mp4.large} type="video/mp4" media={LARGE_FROM} />
              <source src={video.mp4.small} type="video/mp4" media={SMALL_FROM} />
              <source src={video.mp4.phone} type="video/mp4" />
            </>
          ) : null}
        </video>
      </div>

      <div className={s.scrim} aria-hidden="true" />

      <div className={s.inner}>
        <h1 className={s.title}>
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className={s.wordMask}>
              <span className={s.word} style={{ animationDelay: `${120 + i * 70}ms` }}>
                {w}
              </span>
            </span>
          ))}
        </h1>

        <ConsultBar />
      </div>
    </section>
  );
}

/** Пути к файлам видео с учётом подпапки на GitHub Pages. */
export const heroVideo = {
  mp4: {
    large: asset('/video/school-1920.mp4'),
    small: asset('/video/school-1280.mp4'),
    phone: asset('/video/school-720.mp4'),
  },
  webm: {
    large: asset('/video/school-1920.webm'),
    small: asset('/video/school-1280.webm'),
    phone: asset('/video/school-720.webm'),
  },
};

export const heroPoster = asset('/video/school-poster.webp');
