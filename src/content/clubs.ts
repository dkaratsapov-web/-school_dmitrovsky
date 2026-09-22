import data from './data/clubs.json';

/**
 * Кружки и мероприятия.
 *
 * Сами материалы лежат в data/clubs.json: их правят через админку
 * (/admin), а не руками в коде. Здесь остаются только типы и разбор
 * файла, чтобы страница получала данные в проверяемом виде.
 *
 * Тексты, телефоны, ссылки и снимки переносятся как передала школа
 * (ТЗ §15), стоковых картинок вместо настоящих нет (ТЗ §23).
 */

/** Возрастная группа — формулировка со страницы кружков. */
export type ClubGroup = string;

/** Набор групп: он же список вкладок в блоке кружков. */
export const clubGroups: readonly ClubGroup[] = data.groups;

export type Club = {
  title: string;
  /** Короткая строка для карточки. */
  lead: string;
  groups: readonly ClubGroup[];
  /** Абзацы полного описания — для окна материала. */
  text?: readonly string[];
  /** Чему научимся: пункты списка. */
  points?: readonly string[];
  /** Короткие факты: расписание, стоимость, старт. */
  facts?: readonly { label: string; value: string }[];
  /** Ссылка на запись, если школа её передала. */
  signup?: string;
  /** Телефоны записи — как передала школа. */
  phones?: readonly string[];
  image?: { src: string; width: number; height: number; alt: string };
  /** Снимки занятий, если школа их передала: листаются в окне за афишей. */
  gallery?: readonly { src: string; width: number; height: number; alt: string }[];
  /** Материал ещё не передан: карточка-заготовка. */
  draft?: boolean;
};

export const clubsHref = '/kruzhki';

export const clubs: readonly Club[] = data.clubs as unknown as readonly Club[];

export type EventItem = {
  title: string;
  /** Короткая метка даты для афиши, если школа её передала. */
  when?: string;
  /** Короткая строка для списка. */
  text: string;
  /** Абзацы полного описания — для окна материала. */
  full?: readonly string[];
  /** Что будет на мероприятии: пункты списка. */
  points?: readonly string[];
  /** Короткие факты: дата, время, адрес. */
  facts?: readonly { label: string; value: string }[];
  /** Ссылка на регистрацию, если школа её передала. */
  signup?: string;
  image: { src: string; width: number; height: number; alt: string };
};

export const eventsHref = '/meropriyatiya';

export const events: readonly EventItem[] = data.events as unknown as readonly EventItem[];
