import { HeroVideo } from '@/components/site/HeroVideo';
import { getPage } from '@/content/pages-data';
import type { PageBlock } from '@/content/pages-data';
import { asset } from '@/lib/asset';

/**
 * Главная страница.
 *
 * Пересобирается заново, блок за блоком. Сейчас на странице только
 * первый экран — остальные блоки добавляются по мере согласования.
 * Прежняя композиция осталась в истории git.
 */

const page = getPage('index');

const allImages = (page?.records ?? [])
  .flatMap((r) => r.blocks)
  .filter((b): b is Extract<PageBlock, { type: 'image' }> => b.type === 'image');

/**
 * Фотография первого экрана: школьное собрание, реальные ученики.
 * Кадр горизонтальный, лица смещены вправо и не попадают под текст.
 * Заменяется на видео школы, как только придёт файл (QUESTIONS.md, H-1).
 */
const HERO_SRC = '/images/IMG_5183_7f54a7bc0a.webp';
const heroImage = allImages.find((b) => b.src === HERO_SRC) ?? allImages[0];

export default function HomePage() {
  return (
    <HeroVideo
      title="ГБОУ Школа «Дмитровский» г. Москва"
      poster={heroImage ? asset(heroImage.src) : ''}
      posterWidth={heroImage?.width ?? 1600}
      posterHeight={heroImage?.height ?? 1200}
    />
  );
}
