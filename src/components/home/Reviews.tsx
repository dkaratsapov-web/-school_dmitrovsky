'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import {
  reviewsLead,
  rutubeEmbed,
  rutubeLink,
  videoReviews,
  yandexLink,
  yandexOrgId,
} from '@/content/reviews';
import type { VideoReview } from '@/content/reviews';
import { asset } from '@/lib/asset';
import s from './reviews.module.css';

/** Знак школы на карточке, пока для ролика не передан свой кадр. */
function Mark() {
  return (
    <svg className={s.mark} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="60" rx="50" ry="20" />
      <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(60 60 60)" />
      <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(120 60 60)" />
      <circle className={s.markCore} cx="60" cy="60" r="7" />
    </svg>
  );
}

/**
 * Окно с видеоотзывом: проигрыватель Rutube по центру экрана.
 *
 * Плеер подключается только здесь, при открытии окна: восемь встроенных
 * проигрывателей на странице грузились бы ещё до того, как их кто-то
 * собрался смотреть.
 */
function Clip({ review, onClose }: { review: VideoReview; onClose: () => void }) {
  const who = review.name ?? 'Видеоотзыв о школе';

  return (
    <div className={s.clipInner}>
      <iframe
        className={s.clipFrame}
        src={rutubeEmbed(review.rutube)}
        title={who}
        allow="clipboard-write; autoplay"
        allowFullScreen
      />

      <p className={s.clipWho}>
        <span className={s.clipName}>{who}</span>
        {review.role ? <span className={s.clipRole}>{review.role}</span> : null}
        <a
          className={s.clipSource}
          href={rutubeLink(review.rutube)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть на Rutube
        </a>
      </p>

      <button className={s.clipClose} type="button" aria-label="Закрыть" onClick={onClose}>
        <span className={s.clipBar} />
        <span className={s.clipBar} />
      </button>
    </div>
  );
}

/**
 * Отзывы — голоса о школе: снятые на камеру и написанные на Яндекс Картах.
 *
 * Видеоотзывы сняты вертикально, поэтому карточки стоят вертикальными
 * кадрами. Они выложены не в ровную линейку, а по пологой дуге — той же
 * орбите, что в знаке школы: ряд лиц читается как дуга, а не как таблица.
 * Наведение поднимает карточку на общую линию, нажатие открывает ролик
 * окном по центру экрана.
 *
 * Письменные отзывы не пересказываются своими словами и не копируются
 * в код: показывается официальный виджет Яндекс Карт. Отзывы остаются
 * настоящими и обновляются сами.
 *
 * Пока школа не передала ни одного ролика и не подтвердила карточку
 * организации, блок не выводится совсем — пустого раздела на странице
 * не появляется.
 */
export function Reviews() {
  const [open, setOpen] = useState<VideoReview | null>(null);
  const [tab, setTab] = useState<'video' | 'maps'>('video');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const hasVideo = videoReviews.length > 0;
  const hasMaps = yandexOrgId !== '';
  if (!hasVideo && !hasMaps) return null;

  return (
    <section className={s.section} id="reviews" aria-labelledby="reviews-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="reviews-title" className={s.title}>
            Отзывы
          </h2>
          <p className={s.lead}>{reviewsLead}</p>
        </div>

        {hasVideo && hasMaps ? (
          <div className={s.switch} role="tablist" aria-label="Источник отзывов">
            <span
              className={[s.slider, tab === 'maps' ? s.sliderRight : ''].filter(Boolean).join(' ')}
              aria-hidden="true"
            />
            <button
              className={[s.tab, tab === 'video' ? s.tabOn : ''].filter(Boolean).join(' ')}
              type="button"
              role="tab"
              aria-selected={tab === 'video'}
              onClick={() => setTab('video')}
            >
              Видеоотзывы
            </button>
            <button
              className={[s.tab, tab === 'maps' ? s.tabOn : ''].filter(Boolean).join(' ')}
              type="button"
              role="tab"
              aria-selected={tab === 'maps'}
              onClick={() => setTab('maps')}
            >
              Яндекс Карты
            </button>
          </div>
        ) : null}

        {hasVideo && (!hasMaps || tab === 'video') ? (
          <ul className={s.wall}>
            {videoReviews.map((r, i) => (
              <li className={s.card} key={r.rutube} style={{ '--i': i } as React.CSSProperties}>
                <button
                  className={s.face}
                  type="button"
                  onClick={() => setOpen(r)}
                  aria-label={`Смотреть видеоотзыв${r.name ? `: ${r.name}` : ''}`}
                >
                  {r.poster ? (
                    <Image
                      className={s.frame}
                      src={asset(r.poster.src)}
                      alt={r.poster.alt}
                      width={r.poster.width}
                      height={r.poster.height}
                      sizes="(min-width: 1100px) 22vw, (min-width: 640px) 44vw, 78vw"
                    />
                  ) : (
                    <Mark />
                  )}
                  <span className={s.veil} aria-hidden="true" />

                  <span className={s.play} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 6.5l9 5.5-9 5.5z" />
                    </svg>
                  </span>

                  <span className={s.who}>
                    <span className={s.rule} aria-hidden="true" />
                    <span className={s.name}>{r.name ?? 'Видеоотзыв'}</span>
                    {r.role ? <span className={s.role}>{r.role}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {hasMaps && (!hasVideo || tab === 'maps') ? (
          <div className={s.maps}>
            <div className={s.mapsHead}>
              <p className={s.mapsTitle}>Отзывы на Яндекс Картах</p>
              {yandexLink ? (
                <a
                  className={s.mapsLink}
                  href={yandexLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="pin" size={16} />
                  <span>Открыть карточку школы</span>
                </a>
              ) : null}
            </div>

            <iframe
              className={s.widget}
              src={`https://yandex.ru/maps-reviews-widget/${yandexOrgId}?comments`}
              title="Отзывы о школе на Яндекс Картах"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>

      <dialog
        className={s.clip}
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(null);
        }}
      >
        {open ? <Clip review={open} onClose={() => setOpen(null)} /> : null}
      </dialog>
    </section>
  );
}
