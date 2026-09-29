'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import {
  engineerHeroLead,
  engineerHeroPoster,
  engineerHeroTitle,
  engineerHeroVideo,
} from '@/content/engineer';
import { asset } from '@/lib/asset';
import { useScrollProgressVar } from '@/lib/motion';
import s from './engineer-hero.module.css';

/** Версию выбирает браузер по ширине окна: лишний файл не скачивается. */
const LARGE_FROM = '(min-width: 1280px)';
const SMALL_FROM = '(min-width: 768px)';

/* Движение разрешено не всем: при выключенной анимации видео
   не подключается, остаётся кадр. */
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
 * Первый экран инженерного класса.
 *
 * Подложка — кадр во всё окно, поверх чертёжная сетка: она едет от
 * прокрутки и отличает этот экран от кадетского и медиакласса, где
 * разбор свой. Под заголовком размерная линия — та, что ставят
 * на чертеже.
 *
 * Когда школа пришлёт видео, оно встанет на подложку тем же разбором,
 * что у кадетов: три ступени по ширине окна, кадр остаётся постером.
 */
export function EngineerHero() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const allowVideo = useSyncExternalStore(subscribeMedia, readMedia, () => false);
  /* Источники ставим сразу: грузить наперёд нечего, у видео preload="none". */
  const armed = allowVideo;

  /* Шапка знает, что под ней тёмный первый экран. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);


  /* Автозапуск разрешён только беззвучному видео. */
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
    const shown = () => setReady(true);

    if (v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
    start();
    v.addEventListener('canplay', start);
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
    <section className={s.hero} ref={ref} aria-labelledby="engineer-title">
      <div
        className={s.media}
        style={{ '--poster': `url(${asset(engineerHeroPoster.src)})` } as React.CSSProperties}
      >
        <Image
          className={[s.plate, ready ? s.plateHidden : ''].filter(Boolean).join(' ')}
          src={asset(engineerHeroPoster.src)}
          alt={engineerHeroPoster.alt}
          width={engineerHeroPoster.width}
          height={engineerHeroPoster.height}
          priority
          sizes="100vw"
        />

        {engineerHeroVideo ? (
          <video
            ref={videoRef}
            className={[s.plate, ready ? '' : s.plateHidden].filter(Boolean).join(' ')}
            poster={asset(engineerHeroPoster.src)}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          >
            {armed ? (
              <>
                <source src={asset(engineerHeroVideo.webm.large)} type="video/webm" media={LARGE_FROM} />
                <source src={asset(engineerHeroVideo.webm.small)} type="video/webm" media={SMALL_FROM} />
                <source src={asset(engineerHeroVideo.webm.phone)} type="video/webm" />
                <source src={asset(engineerHeroVideo.mp4.large)} type="video/mp4" media={LARGE_FROM} />
                <source src={asset(engineerHeroVideo.mp4.small)} type="video/mp4" media={SMALL_FROM} />
                <source src={asset(engineerHeroVideo.mp4.phone)} type="video/mp4" />
              </>
            ) : null}
          </video>
        ) : null}
      </div>

      <span className={s.grid} aria-hidden="true" />
      <span className={s.scrim} aria-hidden="true" />

      <div className={s.inner}>
        <div className={s.copy}>
          <h1 className={s.title} id="engineer-title">
            {engineerHeroTitle}
          </h1>

          {/* размерная линия, как на чертеже */}
          <span className={s.dim} aria-hidden="true">
            <span className={s.dimLine} />
          </span>

          <p className={s.lead}>{engineerHeroLead}</p>
        </div>

        <ConsultBar />
      </div>
    </section>
  );
}
