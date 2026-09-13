import Image from 'next/image';
import Link from 'next/link';
import { siteName } from '@/content/site';
import s from './site.module.css';

/**
 * Логотип школы.
 *
 * Файл взят из материалов действующего сайта без перерисовки и изменения
 * пропорций (ТЗ §5). Доступные исходники растровые и небольшие:
 * синий вариант 120×120, белый 248×202. Векторный оригинал запрошен
 * отдельно — см. docs/INVENTORY_CHECK.md, пункт BRAND-01.
 */
export function Logo({ href = '/', variant = 'light' }: { href?: string; variant?: 'light' | 'dark' }) {
  const src = variant === 'dark' ? '/brand/logo-white.png' : '/brand/logo.png';
  return (
    <Link className={s.brand} href={href} aria-label={`${siteName} — на главную`}>
      <Image
        className={s.brandLogo}
        src={src}
        alt=""
        width={120}
        height={120}
        priority
      />
      <span className={s.brandText}>
        <span className={s.brandName}>{siteName}</span>
        <span className={s.brandNote}>Москва</span>
      </span>
    </Link>
  );
}
