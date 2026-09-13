import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Grid, Prose } from '@/components/layout/Grid';
import { Section, SectionHead } from '@/components/layout/Section';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardText, CardTitle } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { news, pages } from '@/content/collections';
import { contacts } from '@/content/site';
import s from './home.module.css';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Главная страница.
 *
 * Композиция главной собирается на ЭТАПЕ 3 (ТЗ §14) из фактического
 * наполнения действующего сайта. Пока инвентаризация не выполнена,
 * страница показывает рабочее состояние проекта и не содержит вымышленного
 * контента школы.
 */
const contentReady = news.length > 0 || pages.length > 0 || contacts.phones.length > 0;

const steps: readonly { done: boolean; title: string; text: string }[] = [
  {
    done: false,
    title: '1. Инвентаризация',
    text: 'Сбор всех URL, текстов, изображений, документов, форм и контактов действующего сайта. Требуется доступ к schooldmitrovsky.ru.',
  },
  {
    done: true,
    title: '2. Дизайн-токены и UI Kit',
    text: 'Цвет, типографика, сетка, отступы, радиусы, тени, фокус и анимация. Header, footer, базовый layout и библиотека компонентов.',
  },
  {
    done: false,
    title: '3. Главная страница',
    text: 'Пересборка композиции всех текущих блоков главной на фактическом наполнении.',
  },
  {
    done: false,
    title: '4. Внутренние страницы',
    text: 'Единые шаблоны и перенос всего контента разделов.',
  },
  {
    done: false,
    title: '5. Новости, документы, медиа, формы',
    text: 'Полный перенос материалов с сохранением дат, порядка и получателей заявок.',
  },
  {
    done: false,
    title: '6. Сверка и приёмка',
    text: 'Визуальная сверка по каждому URL, адаптив, SEO, доступность, production build.',
  },
];

export default function HomePage() {
  if (contentReady) {
    // Наполнение перенесено — здесь собирается фактическая композиция главной.
    return null;
  }

  return (
    <>
      <section className={s.statusHero}>
        <Container>
          <div className={s.statusHeroInner}>
            <span className={s.statusBadge}>
              <Icon name="info" size={16} />
              Рабочее состояние проекта
            </span>
            <h1 className={s.statusTitle}>Редизайн сайта школы «Дмитровский»</h1>
            <p className={s.statusLead}>
              Дизайн-система и каркас сайта собраны. Наполнение главной и внутренних страниц
              переносится с действующего сайта после инвентаризации — тексты, фотографии,
              документы и контакты не придумываются.
            </p>
            <div className={s.statusActions}>
              <ButtonLink href="/ui-kit" variant="onDark" size="lg">
                Открыть дизайн-систему
                <Icon name="arrow-right" size={18} />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <SectionHead
          eyebrow="Этапы"
          title="Что сделано и что дальше"
          lead="Порядок работ соответствует разделу 14 технического задания."
        />
        <Grid cols={3}>
          {steps.map((step) => (
            <Card key={step.title}>
              <CardBody>
                <span className={step.done ? s.stepDone : s.stepPending}>
                  <Icon name={step.done ? 'check' : 'clock'} size={16} />
                  {step.done ? 'Готово' : 'В очереди'}
                </span>
                <CardTitle>{step.title}</CardTitle>
                <CardText>{step.text}</CardText>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>Что нужно для продолжения</h2>
          <p>
            Чтобы перенести наполнение без потерь, нужен доступ к содержимому действующего сайта:
            выгрузка страниц, доступ к текущей админке или разрешение на сетевой доступ к домену
            из рабочего окружения. Подробности — в файле <code>docs/INVENTORY.md</code>.
          </p>
        </Prose>
      </Section>
    </>
  );
}
