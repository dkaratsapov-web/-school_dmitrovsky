import type { Metadata } from 'next';
import { CadetHero } from '@/components/cadets/CadetHero';
import { CadetPoints } from '@/components/cadets/CadetPoints';
import { CadetReel } from '@/components/cadets/CadetReel';
import { CadetAdmission } from '@/components/cadets/CadetAdmission';
import { CadetDay } from '@/components/cadets/CadetDay';
import { SectionSeam } from '@/components/site/SectionSeam';
import { cadetPageDescription, cadetPageTitle } from '@/content/cadets';

/**
 * Страница проекта «Кадетский корпус».
 *
 * Собирается по блокам: первый экран, лента кадров, что входит
 * в проект, приём, распорядок дня. Остальное добавляется следующими
 * блоками. Старая страница /kadetskii-class остаётся
 * на месте, пока эта не заменит её целиком (ТЗ §12).
 */
export const metadata: Metadata = {
  title: `${cadetPageTitle} — ГБОУ Школа «Дмитровский»`,
  description: cadetPageDescription,
};

export default function CadetCorpsPage() {
  return (
    <>
      <CadetHero />
      <CadetReel />

      {/* тёмная лента переходит в светлый блок куполом, а не срезом;
          тон тёмной стороны здесь свой */}
      <SectionSeam style={{ '--seam-dark': '#00142c' } as React.CSSProperties} />

      <CadetPoints />
      <CadetAdmission />

      {/* светлый блок приёма переходит в тёмный распорядок тем же куполом */}
      <SectionSeam flip style={{ '--seam-light': '#fff' } as React.CSSProperties} />

      <CadetDay />
    </>
  );
}
