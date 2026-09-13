import type {
  Campus,
  ClubItem,
  DocumentRef,
  EventItem,
  FormConfig,
  NewsItem,
  PageMeta,
  PersonItem,
  ProgramItem,
} from './types';

/**
 * Коллекции контента.
 *
 * Все массивы пустые до завершения инвентаризации (ТЗ §14, шаг 1).
 * Наполнение переносится со старого сайта дословно, порядок новостей и
 * мероприятий сохраняется по датам, похожие материалы не объединяются.
 *
 * Проверка готовности: `npm run check:content`.
 */

export const news: readonly NewsItem[] = [];
export const events: readonly EventItem[] = [];
export const clubs: readonly ClubItem[] = [];
export const programs: readonly ProgramItem[] = [];
export const people: readonly PersonItem[] = [];
export const campuses: readonly Campus[] = [];
export const documents: readonly DocumentRef[] = [];
export const forms: readonly FormConfig[] = [];

/** Карта страниц: путь, title, description старого сайта (ТЗ §12). */
export const pages: readonly PageMeta[] = [];
