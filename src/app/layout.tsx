import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { Footer } from '@/components/site/Footer';
import { CookieNotice } from '@/components/ui/CookieNotice';
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
    default:
      'ГБОУ г. Москвы Школа «Дмитровский» имени Героя Советского Союза В.П. Кислякова',
    template: `%s`,
  },
  description:
    'Школа «Дмитровский» предлагает разнообразные образовательные программы, ' +
    'включая углубленное изучение предметов, кружки и секции по интересам, ' +
    'а также мероприятия и конкурсы, способствующие развитию творческого потенциала учащихся',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#013366',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main">
          Перейти к основному содержанию
        </a>

        <SiteHeader />

        <main id="main">{children}</main>

        <Footer contacts={contacts} />

        <CookieNotice
          text={cookieNotice.text}
          policyLabel={cookieNotice.policyLabel}
          acceptLabel={cookieNotice.acceptLabel}
        />
      </body>
    </html>
  );
}
