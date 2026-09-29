import type { Metadata } from 'next';
import { MediaHero } from '@/components/media/MediaHero';
import { MediaFilm } from '@/components/media/MediaFilm';
import { MediaPartners } from '@/components/media/MediaPartners';
import { MediaProject } from '@/components/media/MediaProject';
import { MediaStudy } from '@/components/media/MediaStudy';
import { SectionDefocus } from '@/components/site/SectionDefocus';
import { mediaPageDescription, mediaPageTitle } from '@/content/media';

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
      <MediaFilm />

      {/* тёмный блок фильма уходит в светлый расфокусом, а не срезом */}
      <SectionDefocus style={{ '--from': '#06121f' } as React.CSSProperties} />

      <MediaStudy />
      <MediaProject />
      <MediaPartners />
    </>
  );
}
