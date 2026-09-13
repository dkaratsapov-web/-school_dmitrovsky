import Image from 'next/image';
import Link from 'next/link';
import logoBlue from '@/assets/brand/logo.png';
import logoWhite from '@/assets/brand/logo-white.png';
import { siteName } from '@/content/site';
import s from './site.module.css';

/**
 * Логотип школы.
 *
 * Файл взят из материалов действующего сайта без перерисовки и изменения
 * пропорций (ТЗ §5). Доступные исходники растровые и небольшие:
 * синий вариант 120×120, белый 248×202. Векторный оригинал запрошен
 * отдельно — см. QUESTIONS.md, пункт B-5.
 */
export function Logo({ href = '/', variant = 'light' }: { href?: string; variant?: 'light' | 'dark' }) {
  return (
    <Link className={s.brand} href={href} aria-label={`${siteName} — на главную`}>
      <Image className={s.brandLogo} src={variant === 'dark' ? logoWhite : logoBlue} alt="" priority />
      <span className={s.brandText}>
        <span className={s.brandName}>{siteName}</span>
        <span className={s.brandNote}>Москва</span>
      </span>
    </Link>
  );
}
