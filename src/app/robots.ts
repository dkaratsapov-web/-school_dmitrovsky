import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/site';

/** robots.txt (ТЗ §12). Существующие страницы от индексации не закрываются. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/ui-kit'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
