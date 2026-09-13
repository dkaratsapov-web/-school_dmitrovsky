import raw from './pages.generated.json';
import altOverrides from './image-alt.json';

/**
 * Контент страниц, собранный из исходного HTML действующего сайта
 * скриптами scripts/extract-content.py и scripts/build-content.py.
 *
 * Файл pages.generated.json перегенерируется из source/ и вручную
 * не редактируется: тексты должны совпадать с опубликованными (ТЗ §7).
 */

export type PageBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string; width: number; height: number }
  | { type: 'video'; url: string; title?: string }
  | { type: 'button'; text: string; href: string };

export type PageRecord = {
  id: string;
  recordType: string | null;
  blocks: PageBlock[];
};

export type SourcePage = {
  slug: string;
  title: string;
  description: string;
  records: PageRecord[];
};

const altBySrc = altOverrides as Record<string, string>;

/**
 * Подставляет alt, написанный по видимому содержанию снимка (ТЗ §11, §23).
 *
 * В исходной Tilda-разметке подписей у изображений не было, поэтому при
 * переносе всем проставили `alt=""`. Тексты лежат в `image-alt.json`
 * отдельно от выгрузки: `pages.generated.json` перегенерируется из `source/`
 * и руками не правится.
 *
 * Пустая строка — осознанное решение для декоративного или непригодного
 * изображения, а не пропуск.
 */
export function withAlt(block: PageBlock): PageBlock {
  if (block.type !== 'image') return block;
  const alt = altBySrc[block.src];
  return alt === undefined || alt === block.alt ? block : { ...block, alt };
}

/** Изображения, которые нечего показывать: файл пустой или битый. */
export const brokenImages = new Set(
  Object.entries(altBySrc)
    .filter(([, alt]) => alt === '')
    .map(([src]) => src),
);

export const sourcePages = raw as unknown as SourcePage[];

export function getPage(slug: string): SourcePage | undefined {
  return sourcePages.find((p) => p.slug === slug);
}

/** Все страницы, кроме главной: они собираются по общему шаблону. */
export const innerPages = sourcePages.filter((p) => p.slug !== 'index');

/**
 * Сводит блоки всех записей страницы в один поток.
 *
 * В исходнике каждая запись Tilda — отдельная полоса, из-за чего короткие
 * подписи оказывались в собственных секциях с большими пустотами. Порядок
 * и состав блоков при этом не меняются.
 */
/** Блоки одной записи страницы: с подставленным alt и без битых изображений. */
export function recordBlocks(page: SourcePage | undefined, id: string): PageBlock[] {
  const blocks = page?.records.find((r) => r.id === id)?.blocks ?? [];
  return blocks.filter((b) => !isNoise(b)).map(withAlt);
}

/**
 * Полоса Tilda с боковым меню.
 *
 * Записи этого типа целиком состоят из пунктов дополнительного меню
 * («О нас», «Педагоги», «Вакансии» и т. д.). На девяти страницах они
 * выводились перед содержимым простыней из девяти строк. Само меню никуда
 * не девается: те же пункты есть в шапке и подвале.
 */
const MENU_RECORD_TYPE = '976';

/**
 * Служебная полоса Tilda (T123, «свой код»).
 *
 * Видимого содержимого у неё нет: в выгрузку попала строка из настроек
 * формы — «Сообщение об успешной отправке!». На действующем сайте её
 * не показывают, это подпись поля в админке.
 */
const SERVICE_RECORD_TYPE = '131';

/**
 * Пункты дополнительного меню, разбросанные Tilda по полосам страницы.
 *
 * Сравнение строгое и с учётом регистра: настоящие заголовки разделов
 * написаны иначе — «питание в школе», «безопасность в школе», «партнеры»,
 * «О школе», «Документы школы», — и под фильтр не попадают.
 */
const NAV_ECHO = new Set([
  'О нас',
  'Педагоги',
  'Вакансии',
  'Документы',
  'Для родителей',
  'Образование',
  'Питание',
  'Безопасность в школе',
  'Партнеры',
]);

/**
 * Остаток от скрытой цены.
 *
 * В каталоге мерча Tilda отдаёт блок цены с `visibility: hidden`, само
 * значение пустое — на действующем сайте цен не видно. В выгрузку попал
 * только знак валюты. Выводить одинокое «р.» нельзя: это не цена.
 */
const EMPTY_PRICE = 'р.';

/** Отбрасывает служебные блоки, которых на действующем сайте не видно. */
export function isNoise(b: PageBlock): boolean {
  if (b.type === 'image') return brokenImages.has(b.src);
  if (b.type !== 'paragraph') return false;
  const t = b.text.trim();
  return NAV_ECHO.has(t) || t === EMPTY_PRICE;
}

/** Записи страницы без служебных полос. */
export function contentRecords(page: SourcePage): PageRecord[] {
  return page.records.filter(
    (r) => r.recordType !== MENU_RECORD_TYPE && r.recordType !== SERVICE_RECORD_TYPE,
  );
}

export function flatten(page: SourcePage): PageBlock[] {
  return contentRecords(page)
    .flatMap((r) => r.blocks)
    .filter((b) => !isNoise(b))
    .map(withAlt);
}

const SENTENCE_END = /[.!?:;]$/;

/**
 * Повторяющиеся служебные подписи.
 *
 * Шаблон Tilda ставит название школы подписью-водяным знаком на каждую
 * полосу, из-за чего на главной оно встречается пять раз подряд. Текст
 * не удаляется из материалов: он остаётся в шапке, подвале и заголовке
 * страницы, а повторы внутри тела не выводятся. Вынесено в QUESTIONS.md.
 */
const REPEATED_LABELS = new Set([
  'ГБОУ Школа «Дмитровский» г. Москва',
]);

/** Убирает служебные повторы и подряд идущие одинаковые абзацы. */
export function dropRepeats(blocks: readonly PageBlock[]): PageBlock[] {
  const seen = new Set<string>();
  const out: PageBlock[] = [];
  for (const b of blocks) {
    if (b.type === 'paragraph') {
      const t = b.text.trim();
      if (REPEATED_LABELS.has(t)) continue;
      if (t.length < 90) {
        if (seen.has(t)) continue;
        seen.add(t);
      }
    }
    out.push(b);
  }
  return out;
}

/**
 * Восстанавливает уровни заголовков.
 *
 * В Zero-блоках Tilda заголовки свёрстаны обычными элементами, поэтому при
 * разборе попадают в абзацы. Короткая строка без завершающей пунктуации,
 * за которой идёт содержательный текст, — это заголовок. Формулировка
 * не меняется, меняется только разметка (ТЗ §11).
 */
/**
 * Пронумерованный шаг: «01. Заполните анкету».
 *
 * Такие строки — подзаголовки шагов, а не абзацы. Без явного правила они
 * повышались до заголовка через один: тот шаг, за которым шёл длинный текст,
 * становился заголовком, а соседние оставались абзацами.
 */
const NUMBERED_STEP = /^\d{1,2}[.)]\s\S/;

export function promoteHeadings(blocks: readonly PageBlock[]): PageBlock[] {
  return blocks.map((b, i) => {
    if (b.type !== 'paragraph') return b;
    const text = b.text.trim();
    if (text.length === 0 || text.length > 70) return b;
    if (NUMBERED_STEP.test(text)) return { type: 'heading' as const, level: 2, text };
    if (SENTENCE_END.test(text)) return b;
    const next = blocks[i + 1];
    const hasBody =
      next !== undefined &&
      ((next.type === 'paragraph' && next.text.length > 70) ||
        next.type === 'list' ||
        next.type === 'image');
    return hasBody ? { type: 'heading' as const, level: 2, text } : b;
  });
}


/**
 * Минимальная длина серии, чтобы считать её перечислением.
 *
 * Два пункта подряд могут оказаться совпадением, три — уже список.
 */
const LIST_RUN_MIN = 3;

/** Длиннее этого — уже абзац, а не пункт перечисления. */
const LIST_ITEM_MAX = 160;

/**
 * Собирает плоские перечисления обратно в списки.
 *
 * В Zero-блоках Tilda пункты списка свёрстаны отдельными строками, поэтому
 * при разборе попадают в абзацы: на странице вакансий одиннадцать качеств
 * педагога шли одиннадцатью абзацами подряд, каждый с точкой с запятой на
 * конце. Формулировки не меняются, меняется только разметка (ТЗ §11).
 */
export function groupFlatLists(blocks: readonly PageBlock[]): PageBlock[] {
  /*
   * Обычный предикат, а не защита типа: иначе TypeScript решит, что в ветке
   * «не пункт» абзацев быть не может, хотя абзац без точки с запятой —
   * по-прежнему абзац.
   */
  const itemText = (b: PageBlock): string | null => {
    if (b.type !== 'paragraph') return null;
    const t = b.text.trim();
    return t.endsWith(';') && t.length <= LIST_ITEM_MAX ? t : null;
  };

  const out: PageBlock[] = [];
  let run: string[] = [];

  const flush = (tail?: string) => {
    if (run.length >= LIST_RUN_MIN) {
      out.push({ type: 'list', items: tail ? [...run, tail] : [...run] });
    } else {
      for (const t of run) out.push({ type: 'paragraph', text: t });
      if (tail) out.push({ type: 'paragraph', text: tail });
      run = [];
      return;
    }
    run = [];
  };

  for (const b of blocks) {
    const item = itemText(b);
    if (item !== null) {
      run.push(item);
      continue;
    }
    // Последний пункт перечисления заканчивается точкой, а не точкой с запятой.
    const text = b.type === 'paragraph' ? b.text.trim() : '';
    if (run.length >= LIST_RUN_MIN && text && text.endsWith('.') && text.length <= LIST_ITEM_MAX) {
      flush(text);
      continue;
    }
    flush();
    out.push(b);
  }
  flush();

  return out;
}
