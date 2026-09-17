import { FactStrip } from '@/components/site/FactStrip';
import { HeroVideo, heroPoster, heroVideo } from '@/components/site/HeroVideo';

/**
 * Главная страница.
 *
 * Пересобирается заново, блок за блоком. Сейчас на странице только
 * первый экран — остальные блоки добавляются по мере согласования.
 */
export default function HomePage() {
  return (
    <>
      <HeroVideo
        title="ГБОУ Школа «Дмитровский» г. Москва"
        poster={heroPoster}
        posterWidth={1920}
        posterHeight={1080}
        video={heroVideo}
      />
      <FactStrip />
    </>
  );
}
