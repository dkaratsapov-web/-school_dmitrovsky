/**
 * Префикс для файлов из public/.
 *
 * На GitHub Pages сайт лежит в подпапке, поэтому пути к изображениям
 * нужно префиксовать. В обычной сборке переменная пуста и путь не меняется.
 */
export const basePath = process.env['NEXT_PUBLIC_BASE_PATH'] ?? '';

export function asset(path: string): string {
  return `${basePath}${path}`;
}
