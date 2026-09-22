import data from './data/news.json';

/**
 * Обновления школы для главной страницы.
 *
 * Материалы лежат в data/news.json и правятся через админку (/admin).
 * Формулировки не переписываются (ТЗ §15), снимки не заменяются
 * стоковыми (ТЗ §23).
 */
export type NewsImage = { src: string; width: number; height: number; alt: string };

export type NewsLink = { label: string; href: string };

export type NewsItem = {
  title: string;
  /** Абзацы материала, если их передали. */
  text?: readonly string[];
  /** Ссылки из текста материала. */
  links?: readonly NewsLink[];
  /** Телефон из текста новости, если он там есть. */
  phone?: { display: string; tel: string };
  /** Все снимки материала. Первый показывается сразу. */
  images?: readonly NewsImage[];
};

/** Куда ведёт ссылка на все материалы. */
export const newsHref = '/meropriyatiya';

export const news: readonly NewsItem[] = data.items as unknown as readonly NewsItem[];
