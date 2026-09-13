import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { CookieNotice } from '@/components/ui/CookieNotice';
import { JsonLd } from '@/components/site/JsonLd';
import { footerNav, legalNav, mainNav } from '@/content/navigation';
import { contacts, cookieNotice, siteName, siteUrl } from '@/content/site';
import { graph, ogImage, organizationSchema, webSiteSchema } from '@/lib/schema';

/**
 * Превью на GitHub Pages — копия боевого сайта на другом адресе.
 * Её закрываем от индексации, чтобы не плодить дубли в выдаче.
 */
const isPreview = process.env['NEXT_PUBLIC_IS_PREVIEW'] === '1';

/**
 * Базовый layout.
 * Метаданные страниц (title, description) на этапе 1 переносятся со старого
 * сайта без изменений (ТЗ §12); значения ниже — технические и будут заменены
 * фактическими после инвентаризации.
 */
const description =
  'Школа «Дмитровский» предлагает разнообразные образовательные программы, ' +
  'включая углубленное изучение предметов, кружки и секции по интересам, ' +
  'а также мероприятия и конкурсы, способствующие развитию творческого потенциала учащихся';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      'ГБОУ г. Москвы Школа «Дмитровский» имени Героя Советского Союза В.П. Кислякова',
    template: `%s`,
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName,
    url: siteUrl,
    images: [ogImage],
  },
  twitter: { card: 'summary_large_image' },
  ...(isPreview ? { robots: { index: false, follow: false } } : {}),
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
        <JsonLd json={graph(organizationSchema(), webSiteSchema())} />

        <a className="skip-link" href="#main">
          Перейти к основному содержанию
        </a>

        <Header nav={mainNav} contacts={contacts} />

        <main id="main">{children}</main>

        <Footer nav={footerNav} serviceNav={legalNav} contacts={contacts} />

        <CookieNotice
          text={cookieNotice.text}
          policyHref={cookieNotice.policyHref}
          policyLabel={cookieNotice.policyLabel}
          acceptLabel={cookieNotice.acceptLabel}
        />
      </body>
    </html>
  );
}
