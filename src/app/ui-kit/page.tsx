import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Grid, Prose } from '@/components/layout/Grid';
import { Section, SectionHead } from '@/components/layout/Section';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardFoot, CardMedia, CardMeta, CardMetaItem, CardText, CardTitle, cardStyles } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/Tag';
import { Quote, Stats } from '@/components/ui/Stat';
import { Accordion } from '@/components/ui/Accordion';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, Skeleton } from '@/components/ui/EmptyState';
import { DocumentList } from '@/components/media/DocumentList';
import { FormDemo, ModalDemo } from './Demos';
import s from './kit.module.css';

export const metadata: Metadata = {
  title: 'UI Kit — дизайн-система',
  robots: { index: false, follow: false },
};

const colorGroups: readonly { title: string; items: readonly { name: string; token: string }[] }[] = [
  {
    title: 'Фирменный синий',
    items: [
      { name: 'navy-900', token: '--c-navy-900' },
      { name: 'navy-800 · основной', token: '--c-navy-800' },
      { name: 'navy-600', token: '--c-navy-600' },
      { name: 'navy-100', token: '--c-navy-100' },
    ],
  },
  {
    title: 'Фирменный бордовый · акцент',
    items: [
      { name: 'wine-800', token: '--c-wine-800' },
      { name: 'wine-700 · действия', token: '--c-wine-700' },
      { name: 'wine-600', token: '--c-wine-600' },
      { name: 'wine-100', token: '--c-wine-100' },
    ],
  },
  {
    title: 'Нейтральные и статусные',
    items: [
      { name: 'ink-900 · текст', token: '--c-ink-900' },
      { name: 'ink-500 · вторичный', token: '--c-ink-500' },
      { name: 'line · границы', token: '--c-line' },
      { name: 'bg · фон', token: '--c-bg' },
      { name: 'success', token: '--c-success' },
      { name: 'error', token: '--c-error' },
      { name: 'warning', token: '--c-warning' },
      { name: 'surface', token: '--c-surface' },
    ],
  },
];

const typeScale: readonly { label: string; token: string; sample: string; tag: 'h1' | 'h2' | 'h3' | 'p' }[] = [
  { label: '--fs-display', token: 'Display', sample: 'Школа, которая учит думать', tag: 'h1' },
  { label: '--fs-h1', token: 'H1', sample: 'Заголовок страницы', tag: 'h1' },
  { label: '--fs-h2', token: 'H2', sample: 'Заголовок раздела', tag: 'h2' },
  { label: '--fs-h3', token: 'H3', sample: 'Подзаголовок блока', tag: 'h3' },
  { label: '--fs-lead', token: 'Lead', sample: 'Вводный абзац, который задаёт контекст раздела и читается крупнее основного текста.', tag: 'p' },
  { label: '--fs-body', token: 'Body', sample: 'Основной текст страницы. Комфортный размер, межстрочный интервал 1,65 и ограниченная длина строки.', tag: 'p' },
  { label: '--fs-small', token: 'Small', sample: 'Вспомогательный текст: подписи, метаданные карточек, пояснения к полям формы.', tag: 'p' },
];

const iconNames: readonly IconName[] = [
  'menu', 'close', 'chevron-down', 'chevron-right', 'arrow-right', 'phone', 'mail', 'pin',
  'clock', 'calendar', 'document', 'download', 'external', 'play', 'search', 'eye',
  'check', 'alert', 'info', 'users', 'upload',
];

const sections: readonly { id: string; label: string }[] = [
  { id: 'colors', label: 'Цвет' },
  { id: 'type', label: 'Типографика' },
  { id: 'spacing', label: 'Сетка и ритм' },
  { id: 'shape', label: 'Радиусы и тени' },
  { id: 'buttons', label: 'Кнопки' },
  { id: 'icons', label: 'Иконки' },
  { id: 'cards', label: 'Карточки' },
  { id: 'content', label: 'Контентные блоки' },
  { id: 'forms', label: 'Формы' },
  { id: 'service', label: 'Служебные' },
];

export default function UiKitPage() {
  return (
    <>
      <div className={s.banner}>
        <Container>
          <strong>Витрина дизайн-системы.</strong> Все тексты, цифры и изображения на этой
          странице — служебные примеры для проверки компонентов. Это не контент сайта школы:
          наполнение переносится с действующего сайта на этапе инвентаризации.
        </Container>
      </div>

      <Section tight>
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'UI Kit' }]} />
        <h1>Дизайн-система</h1>
        <Prose>
          <p>
            Единые токены цвета, типографики, отступов, радиусов, теней, фокуса и анимации.
            Все страницы сайта собираются только из этих компонентов — отдельные стили «под
            страницу» не создаются.
          </p>
        </Prose>
        <nav className={s.toc} aria-label="Разделы дизайн-системы">
          {sections.map((sec) => (
            <a key={sec.id} className={s.tocLink} href={`#${sec.id}`}>
              {sec.label}
            </a>
          ))}
        </nav>
      </Section>

      {/* ----------------------------------------------------------- цвет */}
      <Section id="colors" tone="surface">
        <SectionHead
          eyebrow="Токены"
          title="Цвет"
          lead="Фирменная основа — глубокий синий и бордовый. Бордовый используется дозированно: только для главных действий и акцентов."
        />
        <div className={s.stackCol}>
          {colorGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <div className={s.swatches}>
                {group.items.map((c) => (
                  <div key={c.token} className={s.swatch}>
                    <div className={s.swatchChip} style={{ background: `var(${c.token})` }} />
                    <div className={s.swatchMeta}>
                      <span className={s.swatchName}>{c.name}</span>
                      <span className={s.swatchValue}>{c.token}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- типографика */}
      <Section id="type">
        <SectionHead
          eyebrow="Токены"
          title="Типографика"
          lead="Заголовки — Manrope, основной текст — Golos Text. Оба шрифта подключены локально в WOFF2 с кириллицей."
        />
        <div>
          {typeScale.map((t) => (
            <div key={t.label} className={s.typeRow}>
              <span className={s.typeLabel}>
                {t.token}
                <br />
                {t.label}
              </span>
              <div>
                {t.tag === 'h1' ? (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: `var(${t.label})`, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', display: 'block', color: 'var(--c-navy-900)' }}>
                    {t.sample}
                  </span>
                ) : t.tag === 'h2' || t.tag === 'h3' ? (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: `var(${t.label})`, fontWeight: 700, lineHeight: 1.2, display: 'block', color: 'var(--c-navy-900)' }}>
                    {t.sample}
                  </span>
                ) : (
                  <span style={{ fontSize: `var(${t.label})`, lineHeight: 1.65, display: 'block', maxWidth: 'var(--measure)' }}>
                    {t.sample}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------- сетка и отступы */}
      <Section id="spacing" tone="muted">
        <SectionHead
          eyebrow="Основа"
          title="Сетка и вертикальный ритм"
          lead="12 колонок на desktop, 8 на планшете, 4 на телефоне. Контейнер 1280 px, боковые поля не меньше 16 px на любой ширине."
        />
        <div className={s.specList}>
          <div className={s.specItem}>
            Контейнер
            <code>--container: 1280px</code>
          </div>
          <div className={s.specItem}>
            Боковые поля
            <code>--gutter: 16 → 32px</code>
          </div>
          <div className={s.specItem}>
            Шаг сетки
            <code>--s-1 … --s-24 (4px)</code>
          </div>
          <div className={s.specItem}>
            Ритм секций
            <code>--section-y: 40 → 88px</code>
          </div>
          <div className={s.specItem}>
            Длина строки
            <code>--measure: 68ch</code>
          </div>
          <div className={s.specItem}>
            Область нажатия
            <code>--tap: 44px</code>
          </div>
          <div className={s.specItem}>
            Переходы
            <code>150 / 200 / 250 ms</code>
          </div>
          <div className={s.specItem}>
            Контрольные ширины
            <code>360 · 390 · 768 · 1024 · 1280 · 1440</code>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------- форма и тени */}
      <Section id="shape">
        <SectionHead eyebrow="Основа" title="Радиусы и тени" />
        <div className={s.stackCol}>
          <div className={s.radiusDemo}>
            {[
              ['sm', '8px'],
              ['md', '12px'],
              ['lg', '16px'],
              ['xl', '24px'],
              ['pill', '999px'],
            ].map(([name, value]) => (
              <div key={name} className={s.radiusBox} style={{ borderRadius: `var(--r-${name})` }}>
                {value}
              </div>
            ))}
          </div>
          <div className={s.shadowDemo}>
            {['1', '2', '3'].map((n) => (
              <div key={n} className={s.shadowBox} style={{ boxShadow: `var(--sh-${n})` }}>
                shadow {n}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------- кнопки */}
      <Section id="buttons" tone="surface">
        <SectionHead
          eyebrow="Компоненты"
          title="Кнопки и ссылки"
          lead="Высота не меньше 44 px, заметный фокус, состояния hover и disabled."
        />
        <div className={s.stackCol}>
          <div className={s.stack}>
            <Button variant="primary" size="lg">
              Главное действие
            </Button>
            <Button variant="secondary">Вторичное</Button>
            <Button variant="outline">Контурная</Button>
            <Button variant="ghost">Текстовая</Button>
            <Button variant="primary" size="sm">
              Малая
            </Button>
            <Button variant="secondary" disabled>
              Недоступна
            </Button>
          </div>
          <div className={s.stack}>
            <Button variant="primary">
              С иконкой
              <Icon name="arrow-right" size={18} />
            </Button>
            <ButtonLink href="#buttons" variant="outline">
              Ссылка-кнопка
            </ButtonLink>
            <ButtonLink href="https://example.com" external variant="ghost">
              Внешняя ссылка
              <Icon name="external" size={16} />
            </ButtonLink>
          </div>
          <div className={[s.panel, s.panelDark].join(' ')}>
            <div className={s.stack}>
              <Button variant="onDark">На тёмном фоне</Button>
              <Button variant="onDarkOutline">Контурная на тёмном</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------- иконки */}
      <Section id="icons">
        <SectionHead
          eyebrow="Компоненты"
          title="Иконки"
          lead="Один линейный набор 24×24. Иконка никогда не заменяет подпись."
        />
        <div className={s.stack}>
          {iconNames.map((n) => (
            <span
              key={n}
              className={s.specItem}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-2)' }}
            >
              <Icon name={n} size={22} />
              <code style={{ marginTop: 0 }}>{n}</code>
            </span>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ карточки */}
      <Section id="cards" tone="muted">
        <SectionHead
          eyebrow="Компоненты"
          title="Карточки"
          lead="Единый радиус, внутренние поля, рамка и hover. Абзацы текста в карточки не заворачиваются."
        />
        <Grid cols={3}>
          <Card interactive>
            <CardMedia>
              <span className={s.mediaPlaceholder}>фото 16:10</span>
            </CardMedia>
            <CardBody>
              <CardMeta>
                <CardMetaItem>
                  <Icon name="calendar" size={16} />
                  <time dateTime="2026-09-01">1 сентября 2026</time>
                </CardMetaItem>
                <Tag tone="neutral">Пример метки</Tag>
              </CardMeta>
              <CardTitle>Пример заголовка новости в две строки</CardTitle>
              <CardText>
                Служебный текст анонса. На сайте здесь будет анонс из текущей публикации без
                сокращений и правок.
              </CardText>
              <CardFoot>
                <span className={cardStyles.cardLink}>
                  Читать
                  <Icon name="arrow-right" size={18} />
                </span>
              </CardFoot>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardMeta>
                <Tag tone="accent">Пример возрастной метки</Tag>
              </CardMeta>
              <CardTitle>Карточка кружка без изображения</CardTitle>
              <CardText>
                Служебное описание. Расписание и стоимость выводятся в том виде, в каком они
                опубликованы сейчас.
              </CardText>
              <CardMeta>
                <CardMetaItem>
                  <Icon name="clock" size={16} />
                  Пример расписания
                </CardMetaItem>
              </CardMeta>
            </CardBody>
          </Card>

          <Card>
            <CardMedia>
              <span className={s.mediaPlaceholder}>фото корпуса</span>
            </CardMedia>
            <CardBody>
              <CardMeta>
                <Tag>Пример типа корпуса</Tag>
              </CardMeta>
              <CardTitle>Карточка корпуса</CardTitle>
              <CardMeta>
                <CardMetaItem>
                  <Icon name="pin" size={16} />
                  Адрес переносится без изменений
                </CardMetaItem>
              </CardMeta>
              <CardMeta>
                <CardMetaItem>
                  <Icon name="phone" size={16} />
                  Телефон переносится без изменений
                </CardMetaItem>
              </CardMeta>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      {/* ----------------------------------------------- контентные блоки */}
      <Section id="content">
        <SectionHead eyebrow="Компоненты" title="Контентные блоки" />

        <div className={s.stackCol}>
          <Stats
            items={[
              { value: '10', label: 'Пример показателя' },
              { value: '5', label: 'Пример показателя' },
              { value: '5', label: 'Пример показателя' },
              { value: '—', label: 'Значение из инвентаризации' },
            ]}
          />

          <Grid cols={2}>
            <Quote author="Имя Фамилия" role="должность">
              Пример цитаты. Прямая речь переносится дословно, включая пунктуацию и подпись.
            </Quote>
            <div>
              <h3>FAQ</h3>
              <Accordion
                items={[
                  {
                    question: 'Пример вопроса из раздела FAQ',
                    answer: (
                      <p>
                        Пример ответа. Формулировки вопросов и ответов переносятся полностью, без
                        сокращений.
                      </p>
                    ),
                  },
                  {
                    question: 'Второй пример вопроса',
                    answer: <p>Аккордеон открывается с клавиатуры и объявляет своё состояние.</p>,
                  },
                ]}
              />
            </div>
          </Grid>

          <div>
            <h3>Документы</h3>
            <DocumentList
              items={[
                {
                  title: 'Пример названия документа',
                  href: '#documents',
                  fileType: 'PDF',
                  fileSize: '420 КБ',
                  sourceUrl: 'https://schooldmitrovsky.ru/documents',
                  status: 'pending',
                },
                {
                  title: 'Второй пример документа',
                  href: '#documents',
                  fileType: 'DOCX',
                  sourceUrl: 'https://schooldmitrovsky.ru/documents',
                  status: 'pending',
                },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- формы */}
      <Section id="forms" tone="surface">
        <SectionHead
          eyebrow="Компоненты"
          title="Формы"
          lead="Поля, подсказки, ошибки, согласие, загрузка файла и состояния отправки. Назначение форм и получатели заявок при переносе не меняются."
        />
        <FormDemo />
      </Section>

      {/* ---------------------------------------------------- служебные */}
      <Section id="service" tone="muted">
        <SectionHead eyebrow="Компоненты" title="Служебные состояния" />
        <div className={s.stackCol}>
          <div className={s.stack}>
            <ModalDemo />
          </div>

          <Pagination current={3} total={9} hrefForPage={(p) => `#page-${p}`} />

          <Grid cols={2}>
            <EmptyState
              title="Ничего не найдено"
              text="Пример пустого состояния для списков новостей, мероприятий и кружков."
              icon="search"
            />
            <div className={s.panel}>
              <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-muted)' }}>
                Состояние загрузки
              </p>
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                <Skeleton height={160} radius="var(--r-md)" />
                <Skeleton height={14} width="40%" />
                <Skeleton height={20} width="85%" />
                <Skeleton height={14} />
              </div>
            </div>
          </Grid>
        </div>
      </Section>
    </>
  );
}
