import raw from './pages.generated.json';

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
export function flatten(page: SourcePage): PageBlock[] {
  return page.records.flatMap((r) => r.blocks);
}

const SENTENCE_END = /[.!?:;]$/;

/**
 * Восстанавливает уровни заголовков.
 *
 * В Zero-блоках Tilda заголовки свёрстаны обычными элементами, поэтому при
 * разборе попадают в абзацы. Короткая строка без завершающей пунктуации,
 * за которой идёт содержательный текст, — это заголовок. Формулировка
 * не меняется, меняется только разметка (ТЗ §11).
 */
export function promoteHeadings(blocks: readonly PageBlock[]): PageBlock[] {
  return blocks.map((b, i) => {
    if (b.type !== 'paragraph') return b;
    const text = b.text.trim();
    if (text.length === 0 || text.length > 70) return b;
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
