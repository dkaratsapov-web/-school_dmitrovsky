/**
 * Описание полей материалов для админки.
 *
 * Схема одна на весь редактор: по ней строятся формы кружка, мероприятия,
 * новости и педагога. Так новое поле добавляется в одном месте, а не
 * в четырёх формах подряд.
 */

export type FieldKind =
  | 'text'
  | 'area'
  | 'lines'
  | 'groups'
  | 'image'
  | 'images'
  | 'pairs'
  | 'links'
  | 'phone'
  | 'flag';

export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  /** Подсказка под полем: что сюда писать. */
  hint?: string;
};

export type Schema = {
  /** Как называется один материал: «кружок», «новость». */
  one: string;
  /** Заголовок списка: «Кружки». */
  many: string;
  /** По какому полю подписывать строку в списке. */
  titleKey: string;
  fields: readonly Field[];
};

const IMAGE_HINT = 'Путь к файлу в папке public/images, например /images/club-sambo.webp';

export const clubSchema: Schema = {
  one: 'кружок',
  many: 'Кружки',
  titleKey: 'title',
  fields: [
    { key: 'title', label: 'Название', kind: 'text' },
    { key: 'lead', label: 'Короткая строка на карточке', kind: 'area' },
    { key: 'groups', label: 'Классы', kind: 'groups' },
    { key: 'text', label: 'Описание', kind: 'lines', hint: 'Один абзац на строку' },
    { key: 'points', label: 'Чему научимся', kind: 'lines', hint: 'Один пункт на строку' },
    { key: 'facts', label: 'Расписание и стоимость', kind: 'pairs' },
    { key: 'phones', label: 'Телефоны записи', kind: 'lines' },
    { key: 'signup', label: 'Ссылка на запись', kind: 'text' },
    { key: 'image', label: 'Афиша', kind: 'image', hint: IMAGE_HINT },
    { key: 'gallery', label: 'Снимки занятий', kind: 'images' },
    { key: 'draft', label: 'Заготовка: материал ещё не передан', kind: 'flag' },
  ],
};

export const eventSchema: Schema = {
  one: 'мероприятие',
  many: 'Мероприятия',
  titleKey: 'title',
  fields: [
    { key: 'title', label: 'Название', kind: 'text' },
    { key: 'when', label: 'Когда', kind: 'text', hint: 'Метка на афише: «29 августа»' },
    { key: 'text', label: 'Короткая строка на карточке', kind: 'area' },
    { key: 'full', label: 'Описание', kind: 'lines', hint: 'Один абзац на строку' },
    { key: 'points', label: 'Что будет', kind: 'lines' },
    { key: 'facts', label: 'Дата, место, сбор', kind: 'pairs' },
    { key: 'signup', label: 'Ссылка на регистрацию', kind: 'text' },
    { key: 'image', label: 'Афиша', kind: 'image', hint: IMAGE_HINT },
  ],
};

export const newsSchema: Schema = {
  one: 'новость',
  many: 'Новости',
  titleKey: 'title',
  fields: [
    { key: 'title', label: 'Заголовок', kind: 'text' },
    { key: 'text', label: 'Текст', kind: 'lines', hint: 'Один абзац на строку' },
    { key: 'links', label: 'Ссылки из текста', kind: 'links' },
    { key: 'phone', label: 'Телефон из текста', kind: 'phone' },
    { key: 'images', label: 'Снимки', kind: 'images' },
  ],
};

export const teacherSchema: Schema = {
  one: 'педагога',
  many: 'Педагоги',
  titleKey: 'name',
  fields: [
    { key: 'name', label: 'Имя', kind: 'text' },
    { key: 'role', label: 'Должность', kind: 'text' },
    { key: 'notes', label: 'Подписи на карточке', kind: 'lines' },
    { key: 'achievements', label: 'Достижения', kind: 'lines' },
    { key: 'photo', label: 'Снимок', kind: 'image', hint: IMAGE_HINT },
  ],
};

export const reviewSchema: Schema = {
  one: 'видеоотзыв',
  many: 'Видеоотзывы',
  titleKey: 'name',
  fields: [
    { key: 'rutube', label: 'Идентификатор Rutube', kind: 'text', hint: 'Хвост адреса /video/<id>/' },
    { key: 'name', label: 'Кто говорит', kind: 'text' },
    { key: 'role', label: 'Кем приходится школе', kind: 'text' },
    { key: 'poster', label: 'Кадр для карточки', kind: 'image', hint: IMAGE_HINT },
  ],
};
