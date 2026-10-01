import type { Metadata } from 'next';
import { EngineerHero } from '@/components/engineer/EngineerHero';
import { FilmBlock } from '@/components/film/FilmBlock';
import { StudyBlock } from '@/components/study/StudyBlock';
import { ProjectBlock } from '@/components/project/ProjectBlock';
import { PartnersBlock } from '@/components/partners/PartnersBlock';
import {
  engineerFilm,
  engineerPageDescription,
  engineerPageTitle,
  engineerPartners,
  engineerProject,
  engineerStudy,
} from '@/content/engineer';

/**
 * Страница профиля «Инженерный класс».
 *
 * Страницы профилей типовые: разбор блоков общий, меняется наполнение.
 * Пока первый экран, фильм, углублённое изучение, возможности проекта
 * и партнёры; остальные блоки добавляются следующими.
 * Раздел профильных классов /10-11class остаётся на месте, пока эта
 * страница не заменит его часть (ТЗ §12).
 */
export const metadata: Metadata = {
  title: `${engineerPageTitle} — ГБОУ Школа «Дмитровский»`,
  description: engineerPageDescription,
};

export default function EngineerPage() {
  return (
    <>
      <EngineerHero />
      <FilmBlock film={engineerFilm} />
      <StudyBlock study={engineerStudy} />
      <ProjectBlock project={engineerProject} />
      <PartnersBlock partners={engineerPartners} />
    </>
  );
}
