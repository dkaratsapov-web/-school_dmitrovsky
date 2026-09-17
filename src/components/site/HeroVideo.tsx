'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { StaticImageData } from 'next/image';
import { ConsultBar } from '../forms/ConsultBar';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './hero-video.module.css';

type Props = {
  /** Заголовок первого экрана. */
  title: string;
  /**
   * Видео школы. Пока файла нет, показывается постер — см. QUESTIONS.md.
   * Формат: mp4 без звука, зацикленное.
   */
  videoSrc?: string;
  poster: string | StaticImageData;
  posterWidth?: number;
  posterHeight?: number;
};

/**
 * Первый экран: видео во всю высоту окна под затемнением.
 *
 * Слой с видео связан с прокруткой: по мере ухода экрана он медленно
 * отъезжает и приближается. Параллакс применён только к фону —
 * текст и форма не двигаются (CLAUDE.md, раздел «Движение»).
 */
export function HeroVideo({ title, videoSrc, poster, posterWidth, posterHeight }: Props) {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Пока первый экран на странице, шапка знает, что под ней тёмный фон,
     и остаётся прозрачной. На страницах без него капсулы становятся
     плотными, иначе белый текст не читается на светлом. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (prefersReducedMotion()) {
      v.pause();
      return;
    }
    // автозапуск разрешён только без звука
    v.play().catch(() => {
      /* браузер отказал в автозапуске — остаётся постер */
    });
  }, []);

  const words = title.split(' ');

  return (
    <section className={s.hero} ref={ref}>
      <div className={s.media}>
        {videoSrc ? (
          <video
            ref={videoRef}
            className={s.video}
            src={videoSrc}
            poster={typeof poster === 'string' ? poster : undefined}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : typeof poster === 'string' ? (
          <Image
            className={s.video}
            src={poster}
            alt=""
            width={posterWidth ?? 1600}
            height={posterHeight ?? 1200}
            priority
            sizes="100vw"
          />
        ) : (
          <Image className={s.video} src={poster} alt="" priority sizes="100vw" />
        )}
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

      <span className={s.scrollHint} aria-hidden="true">
        <span className={s.scrollDot} />
      </span>
    </section>
  );
}
