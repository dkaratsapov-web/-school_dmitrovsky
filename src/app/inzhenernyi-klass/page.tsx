import type { Metadata } from 'next';
import { EngineerHero } from '@/components/engineer/EngineerHero';
import { engineerPageDescription, engineerPageTitle } from '@/content/engineer';

/**
 * Страница профиля «Инженерный класс».
 *
 * Собирается по блокам, как страница медиакласса. Пока первый экран;
 * раздел профильных классов /10-11class остаётся на месте, пока эта
 * страница не заменит его часть (ТЗ §12).
 */
export const metadata: Metadata = {
  title: `${engineerPageTitle} — ГБОУ Школа «Дмитровский»`,
  description: engineerPageDescription,
};

export default function EngineerPage() {
  return <EngineerHero />;
}
