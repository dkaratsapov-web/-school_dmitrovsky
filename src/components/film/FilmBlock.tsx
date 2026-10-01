'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { OrbitField } from '../ui/OrbitField';
import { asset } from '@/lib/asset';
import { useScrollProgressVar } from '@/lib/motion';
import s from './film-block.module.css';

/** Фильм страницы: у каждого профиля свой, разбор блока один. */
export type Film = {
  title: string;
  action: string;
  /** Версия для широкого экрана и версия полегче — браузер выбирает сам. */
  large: string;
  small: string;
  poster: string;
  width: number;
  height: number;
};

/** Широкий экран берёт версию побольше: лишний файл не скачивается. */
const LARGE_FROM = '(min-width: 900px)';

/**
 * Фильм профиля.
 *
 * Блок общий для страниц профильных классов: разбор один, меняется только
 * фильм. Авторскую подачу под отдельное направление, если она появится,
 * делают здесь же — отдельной раскладкой, а не копией блока.
 *
 * Кадр закрыт двумя шторками, как окно проектора: по мере подхода блока
 * к экрану они расходятся вверх и вниз и открывают кадр. Движение
 * связано с прокруткой и считается одним числом в CSS-переменную —
 * анимируются только transform.
 *
 * Ролик со звуком и речью, поэтому играет по нажатию. Когда блок уходит
 * из окна, ролик останавливается: звук из-за края экрана — это то,
 * чего человек не просил.
 */
export function FilmBlock({ film }: { film: Film }) {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  /* Ролик замолкает, когда блок ушёл из окна. */
  useEffect(() => {
    const el = ref.current;
    if (!el || !playing || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) videoRef.current?.pause();
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, playing]);

  const play = () => {
    setPlaying(true);
    window.setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.controls = true;
      void v.play().catch(() => {
        /* браузер отказал в запуске — человек нажмёт на кнопку плеера */
      });
    }, 0);
  };

  return (
    <section className={s.section} ref={ref} aria-labelledby={titleId}>
      {/* фон: знаки школы в сетке точек, разметка киноплёнки и луч
          проектора — все слои декоративные и едут от прокрутки */}
      <OrbitField />

      <span className={s.backdrop} aria-hidden="true">
        <span className={s.grid} />
        <span className={s.beam} />
        <span className={s.dust} />
      </span>

      <div className={s.inner}>
        <div className={s.head}>
          <h2 className={s.title} id={titleId}>
            {film.title}
          </h2>
        </div>

        <div className={s.gate}>
          {/* шторки расходятся по мере прокрутки — окно проектора */}
          <span className={[s.shutter, s.shutterTop].join(' ')} aria-hidden="true" />
          <span className={[s.shutter, s.shutterBottom].join(' ')} aria-hidden="true" />

          <div className={s.frame}>
            {playing ? (
              <video
                className={s.video}
                ref={videoRef}
                playsInline
                preload="none"
                poster={asset(film.poster)}
              >
                <source src={asset(film.large)} type="video/mp4" media={LARGE_FROM} />
                <source src={asset(film.small)} type="video/mp4" />
              </video>
            ) : (
              <>
                <Image
                  className={s.poster}
                  src={asset(film.poster)}
                  alt=""
                  width={film.width}
                  height={film.height}
                  sizes="(min-width: 1024px) 70vw, 92vw"
                />

                <button className={s.play} type="button" onClick={play}>
                  <span className={s.playMark} aria-hidden="true" />
                  <span className={s.playWord}>{film.action}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
