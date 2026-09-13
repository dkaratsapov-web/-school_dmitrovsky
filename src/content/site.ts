import type { SiteContacts } from './types';

/**
 * Общие данные сайта.
 *
 * Все значения сняты с действующего сайта (source/source_html) и перенесены
 * без изменений: телефоны, адрес, почта, соцсети, текст cookie-уведомления
 * и идентификаторы счётчиков (ТЗ §7, §13).
 */

export const siteName = 'ГБОУ Школа «Дмитровский»';

/** Полное наименование из og:title действующего сайта. */
export const siteLegalName =
  'Государственное бюджетное общеобразовательное учреждение города Москвы ' +
  '«Школа «Дмитровский» имени Героя Советского Союза В.П. Кислякова';

export const siteUrl = 'https://schooldmitrovsky.ru';

export const contacts: SiteContacts = {
  phones: [
    { display: '+7 (495) 143-21-21', tel: '+74951432121' },
    { display: '+7 (915) 396-66-74', tel: '+79153966674' },
    { display: '+7 (915) 412-54-50', tel: '+79154125450' },
  ],
  emails: ['emelyanenko.vr@sch1631.ru'],
  addresses: ['г. Москва, Карельский бульвар, д. 20'],
  socials: [
    { label: 'Telegram', network: 'Telegram', href: 'https://t.me/sch_dmitrovsky' },
    { label: 'ВКонтакте', network: 'ВКонтакте', href: 'https://vk.com/sch_dmitrovsky' },
    { label: 'MAX', network: 'MAX', href: 'https://max.ru/id7713781783_gos' },
    { label: 'Rutube', network: 'Rutube', href: 'https://rutube.ru/channel/23524799/' },
  ],
};

/** Текст cookie-уведомления, перенесён дословно (блок rec2337058301). */
export const cookieNotice = {
  text:
    'Сайт использует файлы cookie, которые обеспечивают его правильную работу. ' +
    'Оставаясь на сайте, вы соглашаетесь с условиями обработки персональных данных, ' +
    'указанные в политике конфиденциальности. К сайту подключен сервис Я.Метрика',
  policyHref: '/privacy',
  policyLabel: 'политике конфиденциальности',
  acceptLabel: 'принимаю',
};

/** Текст согласия в формах, перенесён дословно. */
export const consentText = 'Я согласен с политикой конфиденциальности сайта';

/**
 * Счётчики действующего сайта. Сохраняются без изменений (ТЗ §13).
 * Подключение выполняется после подтверждения владельцем — см. QUESTIONS.md.
 */
export const analytics = {
  yandexMetrika: '97269398',
  topMailRu: '3534750',
  /** Коллтрекинг i-media, номер проекта из ct_alt_hook.php?pr=… */
  imediaCalltouch: '15266',
} as const;
