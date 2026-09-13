import type { SiteContacts } from './types';

/**
 * Общие данные сайта.
 *
 * ВНИМАНИЕ. Поля ниже заполняются ТОЛЬКО фактическими значениями с
 * действующего сайта schooldmitrovsky.ru после инвентаризации (ТЗ §3).
 * Телефоны, адреса, почта, соцсети и реквизиты не придумываются и не
 * изменяются (ТЗ §15).
 */

/** Название организации. Уточняется по шапке и подвалу старого сайта. */
export const siteName = 'ГБОУ Школа «Дмитровский»';

/** Полное наименование — переносится дословно после инвентаризации. */
export const siteLegalName: string | null = null;

export const siteUrl = 'https://schooldmitrovsky.ru';

/** Контакты. Пустые массивы = данные ещё не перенесены. */
export const contacts: SiteContacts = {
  phones: [],
  emails: [],
  addresses: [],
  socials: [],
};

/** Текст cookie-уведомления. Переносится дословно, если он есть на сайте. */
export const cookieNotice: {
  text: string;
  policyHref: string;
  policyLabel: string;
  acceptLabel: string;
} | null = null;

/** Счётчик Яндекс Метрики — сохраняется действующий (ТЗ §13). */
export const yandexMetrikaId: string | null = null;
