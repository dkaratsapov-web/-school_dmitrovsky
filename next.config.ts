import type { NextConfig } from 'next';

/**
 * Этап 1 — редизайн без изменения наполнения.
 * Редиректы со старых URL добавляются в src/content/redirects.ts
 * ТОЛЬКО после инвентаризации (ТЗ §12).
 */
import { redirects as contentRedirects } from './src/content/redirects';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920],
  },
  async redirects() {
    return contentRedirects.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: true,
    }));
  },
};

export default nextConfig;
