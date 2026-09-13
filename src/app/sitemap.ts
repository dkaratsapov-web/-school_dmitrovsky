import type { MetadataRoute } from 'next';
import { sourcePages } from '@/content/pages-data';
import { siteUrl } from '@/content/site';

/** Файл статический: собирается на этапе сборки. */
export const dynamic = 'force-static';

/**
 * sitemap.xml (ТЗ §12). Состав повторяет действующий сайт: адреса те же,
 * главная отдаётся корнем.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sourcePages.map((p) => ({
    url: p.slug === 'index' ? siteUrl : `${siteUrl}/${p.slug}`,
    lastModified: new Date(),
  }));
}
