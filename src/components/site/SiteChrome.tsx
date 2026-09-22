'use client';

import { usePathname } from 'next/navigation';

/**
 * Обвязка сайта вокруг страницы.
 *
 * Админка живёт по тому же адресу, что и сайт, но это рабочий инструмент:
 * шапка, подвал и уведомление о cookie ей не нужны и мешают. Компонент
 * прячет их на служебных страницах.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') === true) return null;
  return <>{children}</>;
}
