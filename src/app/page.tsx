import { CadetCorps } from '@/components/home/CadetCorps';
import { ClubsEvents } from '@/components/home/ClubsEvents';
import { NewsDeck } from '@/components/home/NewsDeck';
import { QuoteLine } from '@/components/home/QuoteLine';
import { ProfileCards } from '@/components/home/ProfileCards';
import { SectionSeam } from '@/components/home/SectionSeam';
import { StageGrid } from '@/components/home/StageGrid';
import { FactStrip } from '@/components/site/FactStrip';
import { HeroVideo, heroPoster, heroVideo } from '@/components/site/HeroVideo';

/**
 * Главная страница.
 *
 * Пересобирается заново, блок за блоком. Готовы первый экран, лента
 * с цифрами, ступени обучения и профильные 10 - 11 классы.
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
      <StageGrid />
      <SectionSeam />
      <ProfileCards />
      <SectionSeam flip />
      <CadetCorps />
      <QuoteLine />
      <NewsDeck />
      <SectionSeam />
      <ClubsEvents />
    </>
  );
}
