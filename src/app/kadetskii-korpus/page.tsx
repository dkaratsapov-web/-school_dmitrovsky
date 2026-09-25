import type { Metadata } from 'next';
import { CadetHero } from '@/components/cadets/CadetHero';
import { CadetPoints } from '@/components/cadets/CadetPoints';
import { cadetPageDescription, cadetPageTitle } from '@/content/cadets';

/**
 * Страница проекта «Кадетский корпус».
 *
 * Собирается по блокам. Пока первый экран; остальное добавляется
 * следующими блоками. Старая страница /kadetskii-class остаётся
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
      <CadetPoints />
    </>
  );
}
