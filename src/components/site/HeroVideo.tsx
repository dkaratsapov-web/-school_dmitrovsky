'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import { asset } from '@/lib/asset';
import s from './hero-video.module.css';

type Props = {
  /** Заголовок первого экрана. */
  title: string;
  /** Постер: виден сразу и остаётся, пока видео не готово. */
  poster: string;
  posterWidth?: number;
  posterHeight?: number;
  /** Видео школы: по две версии на каждый формат. */
  video?: {
    mp4: { large: string; small: string };
    webm: { large: string; small: string };
  };
};

/** Ниже этой ширины грузим облегчённую версию. */
const SMALL_UP_TO = 1100;

/**
 * Первый экран: видео школы во всё окно под затемнением.
 *
 * Источник выбирается уже в браузере, поэтому лишний файл не скачивается.
 * При prefers-reduced-motion и при включённой экономии трафика видео не
 * грузится вовсе — остаётся постер.
 *
 * Слой с видео связан с прокруткой: медленно отъезжает и приближается.
 * Параллакс только на фоне, текст и форма неподвижны.
 */
export function HeroVideo({ title, poster, posterWidth, posterHeight, video }: Props) {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  /* Пока первый экран на странице, шапка знает, что под ней тёмный фон. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);

  /* Источник ставится прямо на элемент: какой файл грузить, известно
     только в браузере, а состояние React для этого не нужно. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !video) return;
    if (prefersReducedMotion()) return;

    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData === true) return;

    /* WebM меньше при том же качестве; где его нет — берём mp4. */
    const set = v.canPlayType('video/webm; codecs="vp9"') !== '' ? video.webm : video.mp4;
    v.src = window.innerWidth <= SMALL_UP_TO ? set.small : set.large;
    v.play().catch(() => {
      /* браузер отказал в автозапуске — остаётся постер */
    });
  }, [video]);

  const words = title.split(' ');

  return (
    <section className={s.hero} ref={ref}>
      <div className={s.media}>
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
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => setReady(true)}
        />
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
  },
  webm: {
    large: asset('/video/school-1920.webm'),
    small: asset('/video/school-1280.webm'),
  },
};

export const heroPoster = asset('/video/school-poster.webp');
