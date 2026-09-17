import type { NextConfig } from 'next';

/**
 * Этап 1 — редизайн без изменения наполнения.
 * Редиректы со старых URL добавляются в src/content/redirects.ts
 * ТОЛЬКО после инвентаризации (ТЗ §12).
 */
import { redirects as contentRedirects } from './src/content/redirects';

/**
 * Режимы статического экспорта. На боевой сборке не используются.
 *
 * EXPORT_PREVIEW=1  — копия для превью-ссылки, пути относительные.
 * PAGES_BASE_PATH   — сборка под GitHub Pages, где сайт лежит в подпапке
 *                     с именем репозитория.
 */
const isPreviewExport = process.env['EXPORT_PREVIEW'] === '1';
const pagesBasePath = process.env['PAGES_BASE_PATH'] ?? '';
const isPagesExport = pagesBasePath !== '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920],
    ...(isPreviewExport || isPagesExport ? { unoptimized: true } : {}),
  },
  /* Один источник правды для префикса: сборка и код должны видеть
     одно и то же значение. Раньше CI выставлял только PAGES_BASE_PATH,
     а asset() читал NEXT_PUBLIC_BASE_PATH — и файлы из public/ уходили
     без подпапки, то есть в 404. */
  env: { NEXT_PUBLIC_BASE_PATH: isPagesExport ? pagesBasePath : '' },
  ...(isPagesExport
    ? {
        output: 'export' as const,
        basePath: pagesBasePath,
        assetPrefix: pagesBasePath,
        trailingSlash: true,
      }
    : isPreviewExport
    ? { output: 'export' as const, assetPrefix: '.' }
    : {
        async redirects() {
          return contentRedirects.map((r) => ({
            source: r.from,
            destination: r.to,
            permanent: true,
          }));
        },
      }),
};

export default nextConfig;
