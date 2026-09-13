import type { MetadataRoute } from 'next';
import { pages } from '@/content/collections';
import { siteUrl } from '@/content/site';

/** Файл статический: собирается на этапе сборки. */
export const dynamic = 'force-static';

/**
 * sitemap.xml (ТЗ §12).
 * Состав формируется из карты страниц, собранной при инвентаризации,
 * поэтому до её заполнения содержит только главную.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const fromContent = pages.map((p) => ({
    url: `${siteUrl}${p.path}`,
    lastModified: new Date(),
  }));

  return fromContent.length > 0 ? fromContent : [{ url: siteUrl, lastModified: new Date() }];
}
