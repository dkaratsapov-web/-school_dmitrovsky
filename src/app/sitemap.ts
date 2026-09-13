import type { MetadataRoute } from 'next';
import { sourcePages } from '@/content/pages-data';
import { siteUrl } from '@/content/site';

/** Файл статический: собирается на этапе сборки. */
export const dynamic = 'force-static';

/**
 * sitemap.xml (ТЗ §12). Состав повторяет действующий сайт: адреса те же,
 * главная отдаётся корнем.
 *
 * lastModified не выводим: дат последнего изменения материалов в выгрузке
 * нет, а проставлять дату сборки — значит каждый деплой объявлять все
 * 21 страницу обновлёнными. Это ложный сигнал для поисковика.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sourcePages.map((p) => ({
    url: p.slug === 'index' ? siteUrl : `${siteUrl}/${p.slug}`,
  }));
}
