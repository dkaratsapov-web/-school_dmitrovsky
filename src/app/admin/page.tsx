import type { Metadata } from 'next';
import { Gate } from '@/components/admin/Gate';

/**
 * Админка материалов сайта.
 *
 * Страница служебная: в поиск не отдаётся (noindex и robots.txt),
 * в карту сайта не попадает. Ссылок на неё с сайта нет — адрес
 * набирается вручную.
 */
export const metadata: Metadata = {
  title: 'Материалы сайта',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <Gate />;
}
