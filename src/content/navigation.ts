import type { NavItem } from './types';

/**
 * Состав меню.
 *
 * Пункты и адреса сняты с действующего сайта (source/source_html/index.html,
 * блок меню Tilda). Состав, порядок и формулировки сохранены без изменений
 * (ТЗ §8). Ничего не добавлено и не переименовано.
 */
export const mainNav: readonly NavItem[] = [
  { label: 'О нас', href: '/o-nas' },
  { label: 'Обучение в профильных 10 - 11 классах', href: '/10-11class' },
  { label: 'Обучение в 5 - 8 классах', href: '/5-8class' },
  { label: 'Обучение в 1 - 4 классах', href: '/1-4class' },
  { label: 'Обучение в 9 классе', href: '/9-klass' },
  { label: 'Дошколка', href: '/detskii-sad' },
  { label: 'Мероприятия', href: '/meropriyatiya' },
  { label: 'Кружки', href: '/kruzhki' },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Проект «Кадетский корпус»', href: '/kadetskii-class' },
];

/**
 * Порядок пунктов в шапке — как на действующем сайте: два ряда пилюль.
 * «Контакты» здесь нет: в шапке это отдельная кнопка верхнего уровня.
 */
export const headerNav: readonly NavItem[] = [
  { label: 'О нас', href: '/o-nas' },
  { label: 'Дошколка', href: '/detskii-sad' },
  { label: 'Обучение в 1 - 4 классах', href: '/1-4class' },
  { label: 'Обучение в 5 - 8 классах', href: '/5-8class' },
  { label: 'Обучение в 9 классе', href: '/9-klass' },
  { label: 'Обучение в профильных 10 - 11 классах', href: '/10-11class' },
  { label: 'Проект «Кадетский корпус»', href: '/kadetskii-class' },
  { label: 'Мероприятия', href: '/meropriyatiya' },
  { label: 'Кружки', href: '/kruzhki' },
];

/**
 * Ссылки подвала действующего сайта (блок rec735841982).
 * Формулировки перенесены дословно — в подвале «Обучение в профильных
 * 10-11 классах» написано без пробелов вокруг тире, в меню — с пробелами.
 * Расхождение сохранено как есть и вынесено в QUESTIONS.md.
 */
export const footerNav: readonly NavItem[] = [
  { label: 'О нас', href: '/o-nas' },
  { label: 'Обучение в профильных 10-11 классах', href: '/10-11class' },
  { label: 'Обучение в 5 - 8 классах', href: '/5-8class' },
  { label: 'Обучение в 1 - 4 классах', href: '/1-4class' },
  { label: 'Обучение в 9 классе', href: '/9-klass' },
  { label: 'Дошколка', href: '/detskii-sad' },
  { label: 'Кружки', href: '/kruzhki' },
  { label: 'Мероприятия', href: '/meropriyatiya' },
  { label: 'Проект «Кадетский корпус»', href: '/kadetskii-class' },
];

/** Правовые и внешние ссылки подвала. */
export const legalNav: readonly NavItem[] = [
  { label: 'Согласие на обработку персональных данных', href: '/personal' },
  { label: 'Политика конфиденциальности', href: '/privacy' },
  { label: 'Официальный сайт школы', href: 'https://dmitrovsky.mskobr.ru/', external: true },
];
