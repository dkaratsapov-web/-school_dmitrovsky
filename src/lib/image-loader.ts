import widths from '@/content/images.generated.json';

/**
 * Загрузчик next/image для статического сайта.
 *
 * На GitHub Pages нет службы, которая уменьшает снимки на лету, поэтому
 * размеры готовятся заранее (scripts/build-images.mjs), а здесь для каждой
 * ширины из srcset подбирается ближайшая готовая копия. Если копии нет —
 * отдаётся оригинал, картинка не ломается.
 */

/** Тот же ряд, что в scripts/build-images.mjs. */
const STEPS = [320, 480, 768, 1080, 1440] as const;

const basePath = process.env['NEXT_PUBLIC_BASE_PATH'] ?? '';
const known = widths as Record<string, number>;

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (!src.endsWith('.webp')) return src;

  /* В компоненты путь приходит уже с префиксом подпапки — в списке
     он записан без него. */
  const bare = basePath !== '' && src.startsWith(basePath) ? src.slice(basePath.length) : src;
  const source = known[bare];
  if (source === undefined) return src;

  const step = STEPS.find((w) => w >= width && w < source);
  if (step === undefined) return src;

  return `${basePath}/_img${bare.replace(/\.webp$/, `-${step}.webp`)}`;
}
