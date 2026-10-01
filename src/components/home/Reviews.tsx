'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import logoWhite from '@/assets/brand/logo-white.png';
import {
  reviewsLead,
  rutubeEmbed,
  videoReviews as allVideos,
  yandexLink,
  yandexOrgId,
} from '@/content/reviews';
import s from './reviews.module.css';

/**
 * Отзывы — голоса о школе: снятые на камеру и написанные на Яндекс Картах.
 *
 * Ролики лежат на Rutube и выводятся его же проигрывателем: он сам
 * показывает кадр из видео, название и кнопку запуска. Своего кадра
 * к каждому ролику у нас нет, а рисовать заглушку вместо лица незачем.
 *
 * Ролики стоят гармошкой: тот, на который навели, раскрывается во всю
 * ширину, остальные сжимаются в узкие полосы. В закрытой полосе стоит
 * не кадр из ролика, а заставка со знаком школы — настоящим, тем же,
 * что в шапке: обрезанное лицо в полосе шириной с палец не читается
 * и выглядит случайным.
 *
 * Проигрыватель подключается только к раскрытому ролику и с задержкой:
 * если вести курсором вдоль полосы, восемь плееров не грузятся пачкой.
 * Раскрытие ловит и мышь, и фокус с клавиатуры.
 *
 * Письменные отзывы не пересказываются своими словами и не копируются
 * в код: показывается официальный виджет Яндекс Карт. Отзывы остаются
 * настоящими и обновляются сами.
 *
 * Пока школа не передала ни одного ролика и не подтвердила карточку
 * организации, блок не выводится совсем.
 */
type Props = {
  /** Подмена роликов: админка показывает в превью один отзыв. */
  videos?: readonly (typeof allVideos)[number][];
  /** Превью: заголовок блока не нужен, важна карточка. */
  bare?: boolean;
};

export function Reviews({ videos: videoReviews = allVideos, bare = false }: Props = {}) {
  const [tab, setTab] = useState<'video' | 'maps'>('video');
  const [active, setActive] = useState(0);
  /* Проигрыватель подключается только к раскрытому ролику и не сразу:
     если вести курсором вдоль полосы, плееры не грузятся пачкой. */
  const [ready, setReady] = useState(0);

  /* Раскладка гармошки — одна строка на все доли: раскрытый ролик берёт
     пять долей, остальные по одной. Направление выбирает CSS: на широком
     экране это колонки, на телефоне строки. */
  /* Доли дорожки приходят переменными: на широком экране это доли,
     на телефоне — готовые размеры, иначе раскрытый ролик становился
     низкой и широкой полосой, а снят он вертикально. */
  const track = useMemo(
    () => videoReviews.map((_, i) => (i === active ? 'var(--open)' : 'var(--closed)')).join(' '),
    [videoReviews, active],
  );

  useEffect(() => {
    if (ready === active) return;
    const id = window.setTimeout(() => setReady(active), 220);
    return () => window.clearTimeout(id);
  }, [active, ready]);

  const hasVideo = videoReviews.length > 0;
  const hasMaps = yandexOrgId !== '';
  if (!hasVideo && !hasMaps) return null;

  return (
    <section
      className={[s.section, bare ? s.bare : ''].filter(Boolean).join(' ')}
      id="reviews"
      {...(bare ? { 'aria-label': 'Превью материала' } : { 'aria-labelledby': 'reviews-title' })}
    >
      <div className={s.inner}>
        <div className={s.rail}>
          {bare ? null : (
            <div className={s.head}>
              <h2 id="reviews-title" className={s.title}>
                Отзывы
              </h2>
              <p className={s.lead}>{reviewsLead}</p>
            </div>
          )}

          {hasVideo && hasMaps && !bare ? (
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

        </div>

        {hasVideo && (!hasMaps || tab === 'video') ? (
          <ul className={s.wall} style={{ '--track': track } as React.CSSProperties}>
            {videoReviews.map((r, i) => (
              <li
                className={s.card}
                key={r.rutube}
                data-open={i === active ? 'true' : 'false'}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                {i === active && ready === i ? (
                  <span className={s.frame}>
                    <iframe
                      className={s.player}
                      src={rutubeEmbed(r.rutube)}
                      title={r.name ?? 'Видеоотзыв о школе «Дмитровский»'}
                      loading="lazy"
                      allow="clipboard-write"
                      allowFullScreen
                    />
                  </span>
                ) : (
                  <span className={s.splash} aria-hidden="true">
                    <span className={s.sweep} />
                    <Image className={s.mark} src={logoWhite} alt="" />
                    <span className={s.play} />
                  </span>
                )}

                {r.name ? (
                  <p className={s.who}>
                    <span className={s.name}>{r.name}</span>
                    {r.role ? <span className={s.role}>{r.role}</span> : null}
                  </p>
                ) : null}
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
    </section>
  );
}
