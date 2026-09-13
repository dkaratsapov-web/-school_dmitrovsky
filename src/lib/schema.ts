import { contacts, siteLegalName, siteName, siteUrl } from '@/content/site';

/**
 * Микроразметка schema.org в формате JSON-LD.
 *
 * Все значения берутся из слоя контента и не придумываются: наименование,
 * адрес, телефоны, почта и соцсети перенесены с действующего сайта (ТЗ §7).
 * Разметка описывает то, что уже есть на странице, и ничего к ней не
 * добавляет — по ТЗ §12 состав и формулировки не меняются.
 */

/**
 * Обложка для соцсетей. Next.js не наследует openGraph.images в дочерние
 * страницы, если те объявляют свой openGraph, поэтому дескриптор общий.
 */
export const ogImage = {
  url: '/og-cover.jpg',
  width: 1200,
  height: 630,
  alt: 'Ученики в школьной форме в зале на встрече',
} as const;

/** Абсолютный адрес страницы сайта. */
export function canonical(path: string): string {
  return path === '/' ? siteUrl : `${siteUrl}${path}`;
}

type Json = Record<string, unknown>;

/**
 * Образовательная организация. Отдаётся на каждой странице как узел
 * с постоянным @id, чтобы остальные блоки на него ссылались.
 */
export function organizationSchema(): Json {
  return {
    '@type': 'EducationalOrganization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    legalName: siteLegalName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Карельский бульвар, д. 20',
      addressLocality: 'Москва',
      addressCountry: 'RU',
    },
    telephone: contacts.phones.map((p) => p.tel),
    email: contacts.emails,
    sameAs: contacts.socials.map((s) => s.href),
  };
}

/** Сайт целиком. Поиска по сайту нет, поэтому SearchAction не объявляется. */
export function webSiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    inLanguage: 'ru-RU',
    publisher: { '@id': `${siteUrl}/#organization` },
  };
}

/** Хлебные крошки. Повторяют те, что видны на странице. */
export function breadcrumbSchema(items: readonly { label: string; href?: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: canonical(it.href) } : {}),
    })),
  };
}

/** Блок вопросов и ответов. Тексты — ровно те, что выведены на странице. */
export function faqSchema(items: readonly { question: string; answer: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/** Собирает узлы в один граф. */
export function graph(...nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
