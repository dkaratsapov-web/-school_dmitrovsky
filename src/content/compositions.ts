import { brokenImages, contentRecords, isNoise, withAlt } from './pages-data';
import type { PageBlock, PageRecord, SourcePage } from './pages-data';

/**
 * Композиции внутренних страниц.
 *
 * Исходный сайт собран в Tilda: каждая полоса — «запись» со своим типом.
 * При переносе все полосы схлопнулись в один поток абзацев, из-за чего
 * плиточная вёрстка оригинала превращалась в вереницу коротких строк.
 *
 * Здесь тип записи читается обратно и полоса возвращается к своей форме:
 * тарифы — карточками, вопросы родителей — аккордеоном, педагоги — сеткой,
 * каталог мерча — карточками товара.
 *
 * Тексты, их порядок и состав не меняются (ТЗ §7): меняется только то,
 * как они разложены на странице.
 */

/* --------------------------------------------------------- типы записей Tilda */

/** Карточка с заголовком и списком: тарифы, достижения, преимущества. */
const T_CARD = '390';
/** Блок «вопрос — ответ»: абзацы идут парами. */
const T_FAQ = '585';
/** Форма записи: заголовок, подводка, текст согласия. */
const T_FORM = '702';

/* -------------------------------------------------------------------- разделы */

export type ImageBlock = Extract<PageBlock, { type: 'image' }>;

export type Teacher = {
  name: string;
  role?: string;
  notes: string[];
  photo?: ImageBlock;
  achievements: string[];
};

export type Product = {
  title: string;
  description?: string;
  images: ImageBlock[];
};

export type InfoCard = {
  /** Строка над заголовком: цена тарифа и т. п. */
  label?: string;
  title: string;
  items: string[];
};

export type QA = { question: string; answer: string };

/**
 * Предложение по набору: стоимость, состав программы и запись.
 *
 * На действующем сайте это одна полоса, где цена, призыв записаться и девять
 * пунктов программы идут подряд обычными абзацами. Родителю приходится
 * вычитывать цену из середины текста.
 */
export type Offer = {
  lead: string[];
  priceLabel?: string;
  price?: string;
  ctaLabel?: string;
  ctaHref?: string;
  programTitle?: string;
  program: string[];
  image?: ImageBlock;
  note?: string;
};

export type NewsItem = {
  title: string;
  excerpt?: string;
  /** Перечисление внутри публикации: «что обсудили», «чему научились». */
  points: string[];
  images: ImageBlock[];
};

export type FormBlock = {
  title: string;
  lead?: string;
  /** Подписи полей ровно в тех формулировках, что на действующем сайте. */
  fields: string[];
  consent?: string;
};

export type Section =
  | { kind: 'blocks'; blocks: PageBlock[] }
  | { kind: 'offer'; offer: Offer }
  | { kind: 'cards'; items: InfoCard[] }
  | { kind: 'faq'; title?: string; items: QA[] }
  | { kind: 'form'; form: FormBlock; id: string }
  | { kind: 'people'; items: Teacher[] }
  | { kind: 'products'; items: Product[] };

/* ------------------------------------------------------------------ утилиты */

function clean(record: PageRecord): PageBlock[] {
  return record.blocks.filter((b) => !isNoise(b)).map(withAlt);
}

function paragraphs(blocks: readonly PageBlock[]): string[] {
  return blocks
    .filter((b): b is Extract<PageBlock, { type: 'paragraph' }> => b.type === 'paragraph')
    .map((b) => b.text.trim())
    .filter(Boolean);
}

/** ФИО: три слова с заглавной кириллической буквы. */
const FULL_NAME = /^[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+$/;

/** Должность: начинается со слова, обозначающего роль в школе. */
const ROLE_WORD =
  /^(учител|педагог|воспитател|советник|инструктор|методист|старший|руководител|куратор|директор|заместител|психолог|логопед|тренер|преподавател)/i;

/** Служебная подпись карточки Tilda — не текст, а ярлык раскрывающегося блока. */
const CARD_LABEL = 'Достижения';

/* --------------------------------------------------------------- педагоги */

/**
 * Разбирает полосу с карточками педагогов.
 *
 * В исходнике карточка — фотография, должность, ФИО и иногда дополнительная
 * строка, но порядок внутри карточки плавает: где-то ФИО идёт перед
 * должностью, где-то после, а у части педагогов фотография стоит следом за
 * подписью, а не перед ней. Поэтому границей карточки считается не картинка,
 * а само ФИО — оно есть у каждого.
 */
function parseTeacherCards(blocks: readonly PageBlock[]): Teacher[] {
  const out: Teacher[] = [];
  let current: Teacher | null = null;
  /** Предыдущим содержательным абзацем было ФИО. */
  let afterName = false;

  const start = (): Teacher => {
    const t: Teacher = { name: '', notes: [], achievements: [] };
    out.push(t);
    current = t;
    return t;
  };

  blocks.forEach((b, i) => {
    if (b.type === 'image') {
      if (!current || (current.photo && current.name)) start();
      if (current && !current.photo) current.photo = b;
      return;
    }
    if (b.type !== 'paragraph') return;

    const text = b.text.trim();
    if (!text) return;
    // Ярлык раскрывающегося блока: не текст и не граница карточки.
    if (text === CARD_LABEL) return;

    if (FULL_NAME.test(text)) {
      if (!current || current.name) start();
      if (current) current.name = text;
      afterName = true;
      return;
    }

    if (!current) start();
    if (!current) {
      afterName = false;
      return;
    }

    if (!current.role) {
      /*
       * Должность у карточки одна и стоит либо перед ФИО, либо сразу за ним.
       * Строка после ФИО, не похожая на должность, — это подпись, а не
       * должность: у Льяного Кирилла Ульяновича там награда, и выводить её
       * как должность нельзя.
       */
      if (afterName && !ROLE_WORD.test(text)) {
        current.notes.push(text);
        afterName = false;
        return;
      }
      current.role = text;
      afterName = false;
      return;
    }

    /*
     * Карточка уже описана полностью (есть и ФИО, и должность). Вторая
     * строка с должностью означает одно из двух:
     *
     *  — она идёт сразу за ФИО: это вторая должность того же педагога
     *    («Куратор кадетского корпуса», «Руководитель медиацентра «ZOOM»»);
     *  — она оторвана от ФИО: началась следующая карточка. Так в конце
     *    полосы висит «Учитель информатики» без фотографии и без ФИО —
     *    приписывать эту должность предыдущему педагогу нельзя.
     */
    const next = blocks[i + 1];
    const nextIsName =
      next !== undefined && next.type === 'paragraph' && FULL_NAME.test(next.text.trim());
    const startsNewCard = current.name !== '' && ROLE_WORD.test(text) && (!afterName || nextIsName);

    if (startsNewCard) {
      const t = start();
      t.role = text;
      afterName = false;
      return;
    }

    current.notes.push(text);
    afterName = false;
  });

  // Карточки без ФИО в выгрузке неполные — выводить их не на что.
  return out.filter((t) => t.name !== '');
}

/** Полоса вида «ФИО — Достижения — список». */
function parseAchievement(blocks: readonly PageBlock[]): { name: string; items: string[] } | null {
  const name = paragraphs(blocks)[0];
  const list = blocks.find((b): b is Extract<PageBlock, { type: 'list' }> => b.type === 'list');
  if (!name || !list || !FULL_NAME.test(name)) return null;
  return { name, items: [...list.items] };
}

/**
 * Страница «Коллектив преподавателей».
 *
 * Достижения на действующем сайте лежат отдельными раскрывающимися блоками
 * в конце страницы. Здесь они подставляются в карточку своего педагога —
 * тот же текст, но рядом с фотографией и должностью.
 */
export function composeTeachers(page: SourcePage): Section[] {
  const records = contentRecords(page);
  const cardsRecord = records.find((r) => r.blocks.some((b) => b.type === 'image'));
  if (!cardsRecord) return [{ kind: 'blocks', blocks: records.flatMap(clean) }];

  // Полоса начинается с подводки («наша команда» и абзац о коллективе),
  // и только потом идут карточки. Разрез — по первой фотографии.
  const cardsBlocks = clean(cardsRecord);
  const firstPhoto = cardsBlocks.findIndex((b) => b.type === 'image');
  const intro = firstPhoto > 0 ? cardsBlocks.slice(0, firstPhoto) : [];
  const teachers = parseTeacherCards(firstPhoto >= 0 ? cardsBlocks.slice(firstPhoto) : cardsBlocks);
  const byName = new Map(teachers.map((t) => [t.name, t]));

  for (const r of records) {
    if (r === cardsRecord || r.recordType !== T_CARD) continue;
    const found = parseAchievement(clean(r));
    if (!found) continue;
    const person = byName.get(found.name);
    if (person) {
      person.achievements = found.items;
    } else {
      // Педагог, у которого в выгрузке есть только достижения, без карточки.
      const added: Teacher = { name: found.name, notes: [], achievements: found.items };
      teachers.push(added);
      byName.set(found.name, added);
    }
  }

  const rest = records.filter((r) => r !== cardsRecord && r.recordType !== T_CARD);

  return [
    ...(intro.length > 0 ? [{ kind: 'blocks' as const, blocks: intro }] : []),
    { kind: 'people' as const, items: teachers },
    ...rest.map((r) => ({ kind: 'blocks' as const, blocks: clean(r) })),
  ];
}

/* ------------------------------------------------------------------- мерч */

/**
 * Каталог мерча.
 *
 * В исходнике товар описан дважды: плитка каталога (фотографии и название)
 * и попап с подробностями (те же фотографии, название и состав). Попап на
 * новом сайте не воспроизводится, поэтому описания сведены в одну карточку,
 * а повторяющиеся фотографии отсеиваются.
 *
 * Цены нет: на действующем сайте блок цены скрыт стилями и пуст — см.
 * QUESTIONS.md.
 */
export function composeMerch(page: SourcePage): Section[] {
  const sections: Section[] = [];

  for (const r of contentRecords(page)) {
    const blocks = clean(r);
    const hasCatalogue = blocks.some((b) => b.type === 'image') && blocks.some((b) => b.type === 'paragraph');
    const imagesCount = blocks.filter((b) => b.type === 'image').length;

    if (!hasCatalogue || imagesCount < 6) {
      sections.push({ kind: 'blocks', blocks });
      continue;
    }

    const products = new Map<string, Product>();
    let pending: ImageBlock[] = [];
    let current: Product | null = null;

    for (const b of blocks) {
      if (b.type === 'image') {
        pending.push(b);
        continue;
      }
      if (b.type !== 'paragraph') continue;
      const text = b.text.trim();
      if (!text) continue;

      if (pending.length > 0) {
        const existing = products.get(text);
        const product: Product = existing ?? { title: text, images: [] };
        for (const img of pending) {
          if (!product.images.some((x) => x.src === img.src)) product.images.push(img);
        }
        products.set(text, product);
        current = product;
        pending = [];
        continue;
      }

      // Абзац после названия — состав и описание товара из попапа.
      if (current && !current.description && text !== current.title) current.description = text;
    }

    sections.push({ kind: 'products', items: [...products.values()] });
  }

  return sections;
}

/* ------------------------------------------------------------------ новости */

/**
 * Лента новостей главной.
 *
 * В исходнике это одна полоса из 178 блоков: снимки публикации, заголовок,
 * анонс и кнопка «Подробнее». Кнопки ведут в попапы Tilda (`#popup:…`),
 * которых на новом сайте нет и содержимое которых в выгрузку не попало,
 * поэтому они не выводятся — см. QUESTIONS.md.
 *
 * Публикация начинается со снимка: он идёт после текста предыдущей.
 */
export function parseNews(blocks: readonly PageBlock[]): NewsItem[] {
  const out: NewsItem[] = [];
  let current: NewsItem | null = null;
  let lastWasText = true;

  const open = (): NewsItem => {
    const item: NewsItem = { title: '', points: [], images: [] };
    out.push(item);
    return item;
  };

  for (const b of blocks) {
    if (b.type === 'image') {
      const item: NewsItem = !current || lastWasText ? open() : current;
      current = item;
      item.images.push(b);
      lastWasText = false;
      continue;
    }

    const item: NewsItem = current ?? open();
    current = item;

    if (b.type === 'list') {
      item.points.push(...b.items);
      lastWasText = true;
      continue;
    }

    if (b.type === 'heading') {
      if (item.title) item.points.push(b.text.trim());
      else item.title = b.text.trim();
      lastWasText = true;
      continue;
    }

    if (b.type !== 'paragraph') continue;

    const text = b.text.trim();
    if (!text) continue;
    if (!item.title) item.title = text;
    else if (!item.excerpt) item.excerpt = text;
    else item.excerpt = `${item.excerpt} ${text}`;
    lastWasText = true;
  }

  return out.filter((n) => n.title !== '' || n.images.length > 0 || n.points.length > 0);
}

/**
 * Полоса-публикация: снимки и текст одной новости.
 *
 * На главной такие полосы идут подряд несколько десятков. Раньше выводились
 * только первые из них — остальные терялись. Здесь в ленту попадают все.
 */
const T_POST = '766';
/** Полоса-лента: несколько публикаций в одной записи. */
const T_FEED = '923';

/** Собирает ленту новостей главной из всех полос-публикаций. */
export function composeNewsFeed(page: SourcePage): { items: NewsItem[]; usedIds: Set<string> } {
  const items: NewsItem[] = [];
  const usedIds = new Set<string>();

  for (const r of contentRecords(page)) {
    if (r.recordType !== T_POST && r.recordType !== T_FEED) continue;
    const blocks = clean(r);
    if (blocks.length === 0) continue;
    items.push(...parseNews(blocks));
    usedIds.add(r.id);
  }

  return { items, usedIds };
}

/* ------------------------------------------------------------- набор */

/** Подпись строки со стоимостью на действующем сайте. */
const PRICE_LABEL = 'Стоимость обучения';
/** Призыв записаться, стоящий в тексте полосы отдельной строкой. */
const CTA_LABEL = 'Записаться на обучение';

/** Полоса набора: цена, призыв и состав программы. */
function parseOffer(blocks: readonly PageBlock[]): Offer | null {
  const texts = paragraphs(blocks);
  if (!texts.includes(PRICE_LABEL)) return null;

  const offer: Offer = { lead: [], program: [] };
  let stage: 'lead' | 'price' | 'body' | 'program' = 'lead';

  for (const b of blocks) {
    if (b.type === 'image') {
      if (!offer.image) offer.image = b;
      continue;
    }
    if (b.type !== 'paragraph') continue;
    const text = b.text.trim();
    if (!text) continue;

    if (text === PRICE_LABEL) {
      offer.priceLabel = text;
      stage = 'price';
      continue;
    }
    if (stage === 'price') {
      offer.price = text;
      stage = 'body';
      continue;
    }
    if (text === CTA_LABEL) {
      offer.ctaLabel = text;
      continue;
    }
    // Вопрос-подводка к перечню: «Что входит в программу?»
    if (stage === 'body' && text.endsWith('?') && text.length <= 60) {
      offer.programTitle = text;
      stage = 'program';
      continue;
    }
    // Строка с телефоном в конце полосы — это контакт, а не пункт программы.
    if (/(?:\+7|8)[\s\-]?\(?\d{3}/.test(text)) {
      offer.note = text;
      continue;
    }

    if (stage === 'lead') offer.lead.push(text);
    else if (stage === 'program') offer.program.push(text);
    else offer.lead.push(text);
  }

  return offer;
}

/* --------------------------------------------------------- общий разбор */

/** Вопросы и ответы: абзацы идут парами «вопрос — ответ». */
function parseFaq(blocks: readonly PageBlock[]): QA[] {
  const texts = paragraphs(blocks);
  const out: QA[] = [];
  for (let i = 0; i + 1 < texts.length; i += 2) {
    const question = texts[i];
    const answer = texts[i + 1];
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

/** Карточка: строка-ярлык, заголовок и список пунктов. */
function parseCard(blocks: readonly PageBlock[]): InfoCard | null {
  const heading = blocks.find((b): b is Extract<PageBlock, { type: 'heading' }> => b.type === 'heading');
  const list = blocks.find((b): b is Extract<PageBlock, { type: 'list' }> => b.type === 'list');
  if (!heading || !list) return null;
  const label = paragraphs(blocks)[0];
  return { ...(label ? { label } : {}), title: heading.text.trim(), items: [...list.items] };
}

/**
 * Поля короткой формы записи.
 *
 * В выгрузке от неё остались только заголовок, подводка и текст согласия:
 * подписи полей Tilda отдаёт атрибутом placeholder, а не текстом. Значения
 * взяты из исходного HTML формы (`name`, `phone`) и не придуманы.
 */
const SHORT_FORM_FIELDS = ['Имя', 'Телефон'];

function parseForm(blocks: readonly PageBlock[]): FormBlock | null {
  const heading = blocks.find((b): b is Extract<PageBlock, { type: 'heading' }> => b.type === 'heading');
  if (!heading) return null;

  const texts = paragraphs(blocks);
  const consent = texts.find((t) => t.toLowerCase().includes('политикой конфиденциальности'));
  const rest = texts.filter((t) => t !== consent);

  /*
   * У анкеты соискателя подписи полей перечислены абзацами прямо в полосе,
   * у короткой формы записи там одна фраза-подводка. Различаем по числу:
   * список полей — это всегда несколько строк.
   */
  const hasFieldList = rest.length >= 3;
  const lead = hasFieldList ? undefined : rest[0];

  return {
    title: heading.text.trim(),
    ...(lead ? { lead } : {}),
    fields: hasFieldList ? rest : SHORT_FORM_FIELDS,
    ...(consent ? { consent } : {}),
  };
}

/** Разбирает страницу по типам полос Tilda. */
export function composePage(page: SourcePage): Section[] {
  if (page.slug === 'teachers') return composeTeachers(page);
  if (page.slug === 'merch') return composeMerch(page);

  const sections: Section[] = [];
  const records = contentRecords(page);

  for (let i = 0; i < records.length; i += 1) {
    const r = records[i];
    if (!r) continue;
    const blocks = clean(r);
    if (blocks.length === 0) continue;

    if (r.recordType === T_FORM) {
      const form = parseForm(blocks);
      if (form) {
        sections.push({ kind: 'form', form, id: `zapis-${sections.length}` });
        continue;
      }
    }

    const offer = parseOffer(blocks);
    if (offer) {
      sections.push({ kind: 'offer', offer });
      continue;
    }

    if (r.recordType === T_FAQ) {
      const items = parseFaq(blocks);
      if (items.length > 0) {
        sections.push({ kind: 'faq', items });
        continue;
      }
    }

    if (r.recordType === T_CARD) {
      // Идущие подряд карточки собираются в одну сетку.
      const group: InfoCard[] = [];
      let j = i;
      while (j < records.length) {
        const next = records[j];
        if (!next || next.recordType !== T_CARD) break;
        const card = parseCard(clean(next));
        if (!card) break;
        group.push(card);
        j += 1;
      }
      if (group.length > 0) {
        sections.push({ kind: 'cards', items: group });
        i = j - 1;
        continue;
      }
    }

    sections.push({ kind: 'blocks', blocks });
  }

  return linkOffersToForms(mergeTextSections(sections));
}

/**
 * Связывает призыв «Записаться на обучение» с ближайшей формой ниже.
 *
 * Текст призыва на действующем сайте — просто строка. Чтобы он работал,
 * ему нужен адрес: ближайшая форма записи на той же странице.
 */
function linkOffersToForms(sections: readonly Section[]): Section[] {
  return sections.map((section, i) => {
    if (section.kind !== 'offer' || !section.offer.ctaLabel) return section;
    const form = sections.slice(i + 1).find((x) => x.kind === 'form');
    if (!form || form.kind !== 'form') return section;
    return { ...section, offer: { ...section.offer, ctaHref: `#${form.id}` } };
  });
}

/**
 * Склеивает соседние текстовые полосы в одну секцию.
 *
 * Иначе каждая однострочная запись Tilda получает собственную секцию с полным
 * вертикальным отступом, и страница набора начинается с четырёх строк,
 * разделённых пустотой в пол-экрана.
 */
function mergeTextSections(sections: readonly Section[]): Section[] {
  const out: Section[] = [];
  for (const section of sections) {
    const last = out[out.length - 1];
    if (section.kind === 'blocks' && last?.kind === 'blocks') {
      last.blocks = [...last.blocks, ...section.blocks];
      continue;
    }
    out.push(section.kind === 'blocks' ? { kind: 'blocks', blocks: [...section.blocks] } : section);
  }
  return out;
}

export { brokenImages };
