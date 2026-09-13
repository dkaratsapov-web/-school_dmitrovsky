import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Blocks } from '@/components/content/Blocks';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { dropRepeats, flatten, getPage, innerPages, promoteHeadings } from '@/content/pages-data';
import { mainNav } from '@/content/navigation';
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
  return { title: page.title, description: page.description };
}

/** Заголовок H1: берётся из пункта меню, если он есть, иначе из title страницы. */
function pageHeading(slug: string, title: string): string {
  const item = mainNav.find((n) => n.href === `/${slug}`);
  if (item) return item.label;
  // отрезаем хвост «, ГБОУ «Школа «Дмитровский», Москва» из title
  return title.split(/,?\s*ГБОУ/)[0]?.trim() || title;
}

export default async function InnerPage({ params }: Props) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  const heading = pageHeading(slug, page.title);

  return (
    <>
      <div className={s.head}>
        <Container>
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: heading }]} />
          <h1 className={s.title}>{heading}</h1>
          {page.description ? <p className={s.lead}>{page.description}</p> : null}
        </Container>
      </div>

      <Section tone="surface">
        <Blocks blocks={promoteHeadings(dropRepeats(flatten(page)))} />
      </Section>
    </>
  );
}
