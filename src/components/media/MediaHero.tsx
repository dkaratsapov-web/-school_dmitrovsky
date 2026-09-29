'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import { mediaHeroLead, mediaHeroPoster, mediaHeroTitle, mediaHeroVideo } from '@/content/media';
import { asset } from '@/lib/asset';
import { useScrollProgressVar } from '@/lib/motion';
import s from './media-hero.module.css';

/** Версию выбирает браузер по ширине окна: лишний файл не скачивается. */
const LARGE_FROM = '(min-width: 1280px)';
const SMALL_FROM = '(min-width: 768px)';

/* Движение разрешено не всем: при выключенной анимации видео
   не подключается, остаётся кадр.

   Режим экономии трафика раньше тоже отключал видео. Так и оказалось,
   что у владельца на первом экране всегда стоял неподвижный кадр:
   браузер сообщал об экономии, а страница молча отказывалась от видео.
   Ролик первого экрана весит порядка полутора мегабайт и раздаётся
   тремя ступенями по ширине окна — гасить его из-за этого флага
   не за что. */
function subscribeMedia(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function readMedia(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

/**
 * Первый экран медиакласса.
 *
 * Разбор свой, не повторяющий кадетский: заголовок стоит у левого края,
 * а слова взяты в уголки кадра — то, что видит в видоискателе тот, кто
 * снимает. Уголки дочерчиваются при открытии страницы, каждый со своей
 * стороны.
 *
 * Подложка — отрезок выпуска «Медиатона», снятого самим медиаклассом.
 * Видео подключается после загрузки страницы, до тех пор на подложке
 * кадр из того же отрезка.
 */
export function MediaHero() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const allowVideo = useSyncExternalStore(subscribeMedia, readMedia, () => false);

  /* Шапка знает, что под ней тёмный первый экран. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);

  /* Видео — после того, как страница показалась: в гонку с ней
     оно не вступает. */
  useEffect(() => {
    if (!allowVideo) return;

    let timer = 0;
    let late = 0;
    type WithIdle = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const idle = (window as WithIdle).requestIdleCallback;

    const arm = () => {
      if (typeof idle === 'function') idle(() => setArmed(true), { timeout: 2500 });
      else timer = window.setTimeout(() => setArmed(true), 600);
    };

    if (document.readyState === 'complete') arm();
    else {
      window.addEventListener('load', arm, { once: true });
      /* Событие load ждёт все до единого запроса страницы: счётчик,
         встроенный ролик, расширение браузера. Если оно задержалось,
         видео всё равно подключается — но позже картинки и шрифтов. */
      late = window.setTimeout(arm, 1800);
    }

    return () => {
      window.removeEventListener('load', arm);
      if (timer) window.clearTimeout(timer);
      if (late) window.clearTimeout(late);
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

    /* Запасной путь: где кадрового обратного вызова нет, кадр уступает
       место видео по первому же событию воспроизведения — иначе видео
       играет, но остаётся невидимым под постером. */
    const shown = () => setReady(true);
    v.addEventListener('playing', shown);
    v.addEventListener('timeupdate', shown, { once: true });

    const onFirstTouch = () => {
      if (v.paused) start();
    };
    window.addEventListener('pointerdown', onFirstTouch, { once: true });

    return () => {
      v.removeEventListener('canplay', start);
      v.removeEventListener('playing', shown);
      v.removeEventListener('timeupdate', shown);
      window.removeEventListener('pointerdown', onFirstTouch);
    };
  }, [armed]);

  return (
    <section className={s.hero} ref={ref} aria-labelledby="media-title">
      <div
        className={s.media}
        style={{ '--poster': `url(${asset(mediaHeroPoster.src)})` } as React.CSSProperties}
      >
        <Image
          className={[s.plate, ready ? s.plateHidden : ''].filter(Boolean).join(' ')}
          src={asset(mediaHeroPoster.src)}
          alt=""
          width={mediaHeroPoster.width}
          height={mediaHeroPoster.height}
          priority
          sizes="100vw"
        />

        <video
          ref={videoRef}
          className={[s.plate, ready ? '' : s.plateHidden].filter(Boolean).join(' ')}
          poster={asset(mediaHeroPoster.src)}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          {armed ? (
            <>
              <source src={asset(mediaHeroVideo.webm.large)} type="video/webm" media={LARGE_FROM} />
              <source src={asset(mediaHeroVideo.webm.small)} type="video/webm" media={SMALL_FROM} />
              <source src={asset(mediaHeroVideo.webm.phone)} type="video/webm" />
              <source src={asset(mediaHeroVideo.mp4.large)} type="video/mp4" media={LARGE_FROM} />
              <source src={asset(mediaHeroVideo.mp4.small)} type="video/mp4" media={SMALL_FROM} />
              <source src={asset(mediaHeroVideo.mp4.phone)} type="video/mp4" />
            </>
          ) : null}
        </video>
      </div>

      <div className={s.scrim} aria-hidden="true" />

      <div className={s.inner}>
        <div className={s.frame}>
          <span className={[s.corner, s.tl].join(' ')} aria-hidden="true" />
          <span className={[s.corner, s.tr].join(' ')} aria-hidden="true" />
          <span className={[s.corner, s.bl].join(' ')} aria-hidden="true" />
          <span className={[s.corner, s.br].join(' ')} aria-hidden="true" />

          <span className={s.mask}>
            <h1 className={s.title} id="media-title">
              {mediaHeroTitle}
            </h1>
          </span>

          <span className={s.mask}>
            <p className={s.lead}>{mediaHeroLead}</p>
          </span>
        </div>

        <ConsultBar />
      </div>
    </section>
  );
}
