import { Blocks } from './Blocks';
import { FormSection } from './FormSection';
import { InfoCards } from './InfoCards';
import { OfferBlock } from './OfferBlock';
import { ProductGrid } from './ProductGrid';
import { TeacherGrid } from './TeacherGrid';
import { Section } from '@/components/layout/Section';
import { Accordion } from '@/components/ui/Accordion';
import { dropRepeats, groupFlatLists, promoteHeadings } from '@/content/pages-data';
import type { Section as PageSection } from '@/content/compositions';

/**
 * Вывод разобранных полос страницы.
 *
 * Чередование фона задаётся не «через одну», а по смыслу: сетки и карточки
 * стоят на светлом фоне, сплошной текст — на белом. Это возвращает странице
 * вертикальный ритм, который был у плиточной вёрстки оригинала.
 */
export function Sections({ sections }: { sections: readonly PageSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        const key = `${section.kind}-${i}`;

        switch (section.kind) {
          case 'people':
            return (
              <Section key={key} tone="surface">
                <TeacherGrid items={section.items} />
              </Section>
            );

          case 'products':
            return (
              <Section key={key} tone="surface">
                <ProductGrid items={section.items} />
              </Section>
            );

          case 'cards':
            return (
              <Section key={key} tone="muted">
                <InfoCards items={section.items} />
              </Section>
            );

          case 'faq':
            return (
              <Section key={key} tone="surface" narrow>
                <Accordion items={section.items.map((q) => ({ question: q.question, answer: <p>{q.answer}</p> }))} />
              </Section>
            );

          case 'offer':
            return (
              <Section key={key} tone="surface">
                <OfferBlock offer={section.offer} />
              </Section>
            );

          case 'form':
            return (
              <Section key={key} id={section.id} tone="default">
                <FormSection form={section.form} />
              </Section>
            );

          case 'blocks':
            return (
              <Section key={key} tone="default">
                <Blocks blocks={promoteHeadings(groupFlatLists(dropRepeats(section.blocks)))} />
              </Section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
