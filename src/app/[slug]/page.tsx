import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Sections } from '@/components/content/Sections';
import { JsonLd } from '@/components/site/JsonLd';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { composePage } from '@/content/compositions';
import { getPage, innerPages } from '@/content/pages-data';
import { mainNav } from '@/content/navigation';
import { breadcrumbSchema, graph, ogImage } from '@/lib/schema';
import s from './page.module.css';

/**
 * Общий шаблон внутренней страницы.
 *
 * Адреса совпадают с действующим сайтом (ТЗ §12), title и description
 * перенесены без изменений. Содержимое собирается из блоков исходной
 * страницы в том же порядке.
 */

export function generateStaticParams() {
  return innerPages.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${slug}`,
      images: [ogImage],
    },
  };
}

/** Предлоги, которые остаются висеть после отсечения хвоста заголовка. */
const DANGLING = /[\s,]+(?:в|во|на|для|при|от|о|об|у)$/i;

/**
 * Заголовок H1: берётся из пункта меню, если он есть, иначе из title страницы.
 *
 * У title вида «Вакансии в ГБОУ «Школа «Дмитровский», Москва» хвост с
 * названием организации отсекается, иначе он дублируется с шапкой. После
 * отсечения может остаться висячий предлог («Вакансии в») — его убираем.
 * Формулировка при этом не меняется, отсекается только служебный хвост.
 */
function pageHeading(slug: string, title: string): string {
  const item = mainNav.find((n) => n.href === `/${slug}`);
  if (item) return item.label;
  const head = title.split(/,?\s*ГБОУ/)[0]?.trim() ?? '';
  const trimmed = head.replace(DANGLING, '').trim();
  return trimmed || title;
}

export default async function InnerPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  const heading = pageHeading(slug, page.title);

  const crumbs = [{ label: 'Главная', href: '/' }, { label: heading }];

  return (
    <>
      <JsonLd json={graph(breadcrumbSchema(crumbs))} />

      <div className={s.head}>
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className={s.title}>{heading}</h1>
          {page.description ? <p className={s.lead}>{page.description}</p> : null}
        </Container>
      </div>

      <Sections sections={composePage(page)} />
    </>
  );
}
