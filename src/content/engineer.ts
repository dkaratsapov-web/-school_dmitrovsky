/**
 * Инженерный класс — страница профиля.
 *
 * Тексты берутся из описания профиля на странице /10-11class
 * (см. profiles.ts) и здесь не переписываются: перечень предметов
 * и программа колледжа живут в одном месте.
 */
import { profiles, profilesLead } from './profiles';

/** Описание профиля из общего списка: тексты живут там и не дублируются. */
export const engineerProfile = profiles.find((p) => p.name === 'Инженерный класс');

/** Короткое имя: вкладка браузера, поиск, хлебные крошки. */
export const engineerPageTitle = 'Инженерный класс';

/** Заголовок первого экрана. */
export const engineerHeroTitle = 'Инженерный класс';

/** Строка под заголовком — формулировка сайта, общая для профилей. */
export const engineerHeroLead = profilesLead;

export const engineerPageDescription =
  'Инженерный класс школы «Дмитровский»: углублённые математика, физика ' +
  'и информатика, программа профессионального обучения в колледже. ' +
  'Набор в профильные 10-11 классы на конкурсной основе.';

/**
 * Подложка первого экрана.
 *
 * Пока кадр: снимок инженерного класса, присланный школой. Когда придёт
 * видео, его кладут в public/video тремя ступенями по ширине окна
 * (как у кадетов и медиакласса) и подставляют в engineerHeroVideo —
 * разметка первого экрана уже рассчитана на видео, кадр остаётся
 * постером.
 */
export const engineerHeroPoster = {
  src: '/images/profile-inzhenernyi.webp',
  width: 1200,
  height: 800,
  alt: '',
};

type HeroSources = { large: string; small: string; phone: string };

/** Видео первого экрана. Пока его нет — на подложке стоит кадр. */
export const engineerHeroVideo: { webm: HeroSources; mp4: HeroSources } | null = null;
