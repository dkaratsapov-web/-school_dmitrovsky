import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { CookieNotice } from '@/components/ui/CookieNotice';
import { footerNav, mainNav } from '@/content/navigation';
import { contacts, cookieNotice, siteName, siteUrl } from '@/content/site';

/**
 * Базовый layout.
 * Метаданные страниц (title, description) на этапе 1 переносятся со старого
 * сайта без изменений (ТЗ §12); значения ниже — технические и будут заменены
 * фактическими после инвентаризации.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s — ${siteName}`,
  },
  description: '',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#102a5c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main">
          Перейти к основному содержанию
        </a>

        <Header nav={mainNav} contacts={contacts} />

        <main id="main">{children}</main>

        <Footer nav={mainNav} serviceNav={footerNav} contacts={contacts} />

        {cookieNotice ? (
          <CookieNotice
            text={cookieNotice.text}
            policyHref={cookieNotice.policyHref}
            policyLabel={cookieNotice.policyLabel}
            acceptLabel={cookieNotice.acceptLabel}
          />
        ) : null}
      </body>
    </html>
  );
}
