'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import {
  cadetHeroPoster,
  cadetHeroVideo,
  cadetLead,
  cadetPageTitle,
  cadetPrice,
} from '@/content/cadets';
import { asset } from '@/lib/asset';
import { useScrollProgressVar } from '@/lib/motion';
import s from './cadet-hero.module.css';

/* Движение разрешено не всем: при выключенной анимации и режиме экономии
   трафика видео не подключается, остаётся кадр. Значение читается
   подпиской, а не состоянием в эффекте. */
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
 * Первый экран страницы кадетского корпуса.
 *
 * Держится той же логики, что и первый экран школы: тёмный кадр во всё
 * окно, поверх него название, короткая подпись и форма записи — чтобы
 * записаться можно было не прокручивая страницу.
 *
 * Отличие в разборе: у корпуса свой знак — вертикальная черта у заголовка
 * и строка со стоимостью рядом с ней. Так страница проекта читается как
 * своя глава, а не как копия главной.
 *
 * Видео подключается после загрузки страницы и только если школа его
 * передала; до тех пор на подложке кадр из фильма о корпусе.
 */
export function CadetHero() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const allowVideo = useSyncExternalStore(subscribeMedia, readMedia, () => false);
  const poster = asset(cadetHeroPoster.src);

  /* Шапка знает, что под ней тёмный первый экран. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);

  /* Видео — после того, как страница показалась: в гонку с ней
     оно не вступает. */
  useEffect(() => {
    if (!allowVideo || !cadetHeroVideo) return;

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

  /* Автозапуск разрешён только беззвучному видео, и свойство muted React
     в разметку не выносит — выставляем его сами. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !armed) return;

    v.muted = true;
    v.defaultMuted = true;

    const start = () => {
      v.play().catch(() => {
        /* браузер отказал в автозапуске — ждём первого касания */
      });
    };

    if (v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
    start();
    v.addEventListener('canplay', start);

    type WithFrameCb = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    const withFrame = v as WithFrameCb;
    if (typeof withFrame.requestVideoFrameCallback === 'function') {
      withFrame.requestVideoFrameCallback(() => setReady(true));
    }

    const onFirstTouch = () => {
      if (v.paused) start();
    };
    window.addEventListener('pointerdown', onFirstTouch, { once: true });

    return () => {
      v.removeEventListener('canplay', start);
      window.removeEventListener('pointerdown', onFirstTouch);
    };
  }, [armed]);

  return (
    <section className={s.hero} ref={ref} aria-labelledby="cadets-title">
      <div className={s.media} style={{ '--poster': `url(${poster})` } as React.CSSProperties}>
        <Image
          className={[s.plate, ready ? s.plateHidden : ''].filter(Boolean).join(' ')}
          src={poster}
          alt=""
          width={cadetHeroPoster.width}
          height={cadetHeroPoster.height}
          priority
          sizes="100vw"
        />

        {cadetHeroVideo ? (
          <video
            ref={videoRef}
            className={[s.plate, ready ? '' : s.plateHidden].filter(Boolean).join(' ')}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          >
            {armed ? (
              <>
                <source src={asset(cadetHeroVideo.webm)} type="video/webm" />
                <source src={asset(cadetHeroVideo.mp4)} type="video/mp4" />
              </>
            ) : null}
          </video>
        ) : null}
      </div>

      <div className={s.scrim} aria-hidden="true" />

      <div className={s.inner}>
        <div className={s.words}>
          <span className={s.rule} aria-hidden="true" />

          <div className={s.text}>
            <span className={s.mask}>
              <h1 className={s.title} id="cadets-title">
                {cadetPageTitle}
              </h1>
            </span>

            <span className={s.mask}>
              <p className={s.lead}>{cadetLead}</p>
            </span>

            <span className={s.mask}>
              <p className={s.price}>
                <span className={s.priceLabel}>{cadetPrice.label}</span>
                <span className={s.priceValue}>{cadetPrice.value}</span>
                <span className={s.priceNote}>{cadetPrice.note}</span>
              </p>
            </span>
          </div>
        </div>

        <ConsultBar />
      </div>
    </section>
  );
}
