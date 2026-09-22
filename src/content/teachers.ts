import data from './data/teachers.json';

/**
 * Педагоги школы.
 *
 * Карточки лежат в data/teachers.json и правятся через админку (/admin).
 * Имена, должности, подписи и достижения перенесены со страницы
 * /teachers дословно (ТЗ §7, §15), снимки — те же файлы, что
 * опубликованы сейчас (ТЗ §23).
 */
export type Teacher = {
  name: string;
  /** Должность — формулировка сайта, включая строчную букву у отдельных. */
  role: string;
  /** Дополнительные строки карточки: звание, кураторство, диагностика. */
  notes?: readonly string[];
  /** Список достижений из всплывающего окна страницы. */
  achievements?: readonly string[];
  photo: { src: string; width: number; height: number; alt: string };
};

/** Подпись раздела со страницы /teachers, дословно. */
export const teachersLead: string = data.lead;

export const teachers: readonly Teacher[] = data.items as unknown as readonly Teacher[];
