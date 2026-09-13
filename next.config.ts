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
  /**
   * Превью-сборки (GitHub Pages и локальный экспорт) — копия боевого сайта
   * на другом адресе. Её нельзя отдавать поисковикам, иначе в выдаче
   * появится дубль. Флаг читается в src/app/layout.tsx.
   */
  env: {
    NEXT_PUBLIC_IS_PREVIEW: isPreviewExport || isPagesExport ? '1' : '',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920],
    ...(isPreviewExport || isPagesExport ? { unoptimized: true } : {}),
  },
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
