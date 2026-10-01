import type { Metadata } from 'next';
import { MediaHero } from '@/components/media/MediaHero';
import { FilmBlock } from '@/components/film/FilmBlock';
import { MediaFaq } from '@/components/media/MediaFaq';
import { MediaPartners } from '@/components/media/MediaPartners';
import { MediaProject } from '@/components/media/MediaProject';
import { MediaStudy } from '@/components/media/MediaStudy';
import { mediaFilm, mediaPageDescription, mediaPageTitle } from '@/content/media';

/**
 * Страница профиля «Медиакласс».
 *
 * Собирается по блокам. Пока первый экран; остальное добавляется
 * следующими блоками. Раздел профильных классов /10-11class остаётся
 * на месте, пока эта страница не заменит его часть (ТЗ §12).
 */
export const metadata: Metadata = {
  title: `${mediaPageTitle} — ГБОУ Школа «Дмитровский»`,
  description: mediaPageDescription,
};

export default function MediaClassPage() {
  return (
    <>
      <MediaHero />
      <FilmBlock film={mediaFilm} />
      <MediaStudy />
      <MediaProject />
      <MediaPartners />
      <MediaFaq />
    </>
  );
}
