import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Section narrow>
      <h1>Страница не найдена</h1>
      <EmptyState
        icon="search"
        title="Ошибка 404"
        text="Такой страницы на сайте нет. Возможно, адрес введён с опечаткой или страница была перемещена."
        action={
          <ButtonLink href="/" variant="primary">
            На главную
          </ButtonLink>
        }
      />
    </Section>
  );
}
