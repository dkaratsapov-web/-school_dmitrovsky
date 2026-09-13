import Link from 'next/link';
import { siteName } from '@/content/site';
import s from './site.module.css';

/**
 * Логотип школы.
 *
 * ТЗ §5: логотип не перерисовывается, не деформируется, пропорции не меняются.
 * До получения оригинального файла логотипа (SVG или PNG высокого качества)
 * выводится нейтральная текстовая плашка — см. docs/INVENTORY.md, BRAND-01.
 * Когда файл будет добавлен в /public/brand/logo.svg, компонент подставит его
 * без изменения пропорций.
 */
export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link className={s.brand} href={href} aria-label={`${siteName} — на главную`}>
      <span className={s.brandMark} aria-hidden="true">
        Д
      </span>
      <span className={s.brandText}>
        <span className={s.brandName}>{siteName}</span>
        <span className={s.brandNote}>Москва</span>
      </span>
    </Link>
  );
}
