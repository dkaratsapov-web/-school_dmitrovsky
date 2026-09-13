/**
 * Типы слоя контента.
 *
 * ЭТАП 1. Весь фактический контент (тексты, телефоны, адреса, ссылки, даты,
 * изображения, документы) переносится с действующего сайта schooldmitrovsky.ru
 * БЕЗ смысловых изменений (ТЗ §7). Ни одно значение в этом слое не должно
 * быть придумано, сокращено или переписано.
 *
 * Поле `source` у каждой сущности фиксирует URL-источник на старом сайте —
 * это основа таблицы соответствия из docs/INVENTORY.md.
 */

/** Статус переноса элемента. Используется только в рабочих отчётах, не на сайте. */
export type TransferStatus = 'pending' | 'transferred' | 'review';

export type SourceRef = {
  /** URL страницы старого сайта, откуда взят элемент. */
  sourceUrl: string;
  status: TransferStatus;
  /** Пометка REVIEW: спорное назначение, требует подтверждения владельца. */
  note?: string;
};

/* ------------------------------------------------------------------ навигация */

export type NavItem = {
  label: string;
  /**
   * Адрес страницы. `null` означает «URL ещё не подтверждён инвентаризацией».
   * Такие пункты не выводятся как рабочие ссылки и попадают в отчёт
   * `npm run check:content`.
   */
  href: string | null;
  children?: readonly NavItem[];
  /** Внешняя ссылка (другой домен). */
  external?: boolean;
};

/* ------------------------------------------------------------------ контакты */

export type Phone = {
  /** Номер ровно в том виде, в каком он опубликован сейчас. */
  display: string;
  /** Значение для tel: — только цифры и +. */
  tel: string;
  label?: string;
};

export type Campus = {
  id: string;
  /** Название корпуса в текущей формулировке сайта. */
  title: string;
  address: string;
  phones: readonly Phone[];
  email?: string;
  kind?: string;
  image?: ImageRef;
} & SourceRef;

export type SocialLink = {
  label: string;
  href: string;
  /** Название сети как указано сейчас (ВКонтакте, Telegram и т. п.). */
  network: string;
};

export type SiteContacts = {
  phones: readonly Phone[];
  emails: readonly string[];
  addresses: readonly string[];
  socials: readonly SocialLink[];
};

/* ------------------------------------------------------------------ медиа */

export type ImageRef = {
  src: string;
  /** Осмысленный alt. Для декоративных изображений — пустая строка (ТЗ §11). */
  alt: string;
  width: number;
  height: number;
  /** Подпись под фото, если она есть на текущем сайте. */
  caption?: string;
};

export type VideoRef = {
  /** Ссылка на видео в текущем виде (YouTube, VK Video, Rutube и т. п.). */
  url: string;
  title: string;
  poster?: ImageRef;
};

export type DocumentRef = {
  title: string;
  href: string;
  /** PDF, DOCX, XLSX… — как есть. */
  fileType?: string;
  fileSize?: string;
} & SourceRef;

/* ------------------------------------------------------------------ материалы */

export type NewsItem = {
  slug: string;
  title: string;
  /** ISO-дата публикации. Порядок новостей сохраняется по датам (ТЗ §7). */
  date: string;
  /** Анонс ровно в текущей формулировке; если анонса нет — не придумывать. */
  excerpt?: string;
  /** Полный текст в виде блоков; переносится целиком. */
  body: readonly ContentBlock[];
  cover?: ImageRef;
  gallery?: readonly ImageRef[];
  tags?: readonly string[];
} & SourceRef;

export type EventItem = {
  slug: string;
  title: string;
  date: string;
  timeText?: string;
  place?: string;
  description?: string;
  cover?: ImageRef;
} & SourceRef;

export type ClubItem = {
  slug: string;
  title: string;
  /** Возраст/класс в текущей формулировке. */
  ageText?: string;
  scheduleText?: string;
  priceText?: string;
  description?: string;
  cover?: ImageRef;
} & SourceRef;

export type ProgramItem = {
  slug: string;
  title: string;
  /** Короткое описание направления в текущей формулировке. */
  summary?: string;
  href: string | null;
  cover?: ImageRef;
} & SourceRef;

export type PersonItem = {
  id: string;
  name: string;
  role: string;
  photo?: ImageRef;
  phone?: Phone;
  email?: string;
} & SourceRef;

/* ------------------------------------------------------------------ блоки */

export type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: readonly string[] }
  | { type: 'image'; image: ImageRef }
  | { type: 'gallery'; images: readonly ImageRef[] }
  | { type: 'video'; video: VideoRef }
  | { type: 'quote'; text: string; author?: string; role?: string }
  | { type: 'documents'; items: readonly DocumentRef[] }
  | { type: 'html'; html: string };

/* ------------------------------------------------------------------ формы */

export type FormFieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: readonly { value: string; label: string }[];
};

export type FormConfig = {
  id: string;
  title: string;
  /** Описание формы в текущей формулировке, если оно есть. */
  description?: string;
  fields: readonly FormFieldConfig[];
  /** Текст согласия на обработку данных — переносится дословно. */
  consentText: string;
  submitLabel: string;
  successTitle: string;
  successText?: string;
  /** Куда уходит заявка сейчас. Менять нельзя без проверки (ТЗ §13). */
  endpoint: string | null;
} & SourceRef;

/* ------------------------------------------------------------------ страницы */

export type PageMeta = {
  /** Адрес на новом сайте. Должен совпадать со старым (ТЗ §12). */
  path: string;
  title: string;
  description: string;
} & SourceRef;

export type Redirect = {
  from: string;
  to: string;
  reason: string;
};
