'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import { mediaHeroLead, mediaHeroPoster, mediaHeroTitle } from '@/content/media';
import { asset } from '@/lib/asset';
import { useScrollProgressVar } from '@/lib/motion';
import s from './media-hero.module.css';

/**
 * Первый экран медиакласса.
 *
 * Разбор свой, не повторяющий кадетский: заголовок стоит у левого края,
 * а слова взяты в уголки кадра — то, что видит в видоискателе тот, кто
 * снимает. Уголки дочерчиваются при открытии страницы, каждый со своей
 * стороны.
 *
 * Подложка — кадр из студии; когда школа передаст видео, оно встанет
 * сюда тем же разбором, что на странице кадетского корпуса, а кадр
 * останется постером.
 */
export function MediaHero() {
  const ref = useScrollProgressVar<HTMLElement>('--p');

  /* Шапка знает, что под ней тёмный первый экран. */
  useEffect(() => {
    document.body.classList.add('has-hero');
    return () => document.body.classList.remove('has-hero');
  }, []);

  return (
    <section className={s.hero} ref={ref} aria-labelledby="media-title">
      <div className={s.media}>
        <Image
          className={s.plate}
          src={asset(mediaHeroPoster.src)}
          alt=""
          width={mediaHeroPoster.width}
          height={mediaHeroPoster.height}
          priority
          sizes="100vw"
        />
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
