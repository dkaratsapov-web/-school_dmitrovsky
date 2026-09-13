import Image from 'next/image';
import { Blocks } from '@/components/content/Blocks';
import { Container } from '@/components/layout/Container';
import { Section, SectionHead } from '@/components/layout/Section';
import { Accordion } from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Stats } from '@/components/ui/Stat';
import { getPage } from '@/content/pages-data';
import type { PageBlock } from '@/content/pages-data';
import { asset } from '@/lib/asset';
import s from './home.module.css';

/**
 * Главная страница.
 *
 * Собрана из блоков действующей главной (source/extracted/index.json).
 * Тексты, цифры и фотографии перенесены без изменений (ТЗ §7); изменены
 * только композиция, сетка и оформление.
 */

const page = getPage('index');
const records = page?.records ?? [];

function record(id: string) {
  return records.find((r) => r.id === id);
}

function texts(id: string): string[] {
  return (record(id)?.blocks ?? [])
    .filter((b): b is Extract<PageBlock, { type: 'paragraph' }> => b.type === 'paragraph')
    .map((b) => b.text);
}

function images(id: string) {
  return (record(id)?.blocks ?? []).filter(
    (b): b is Extract<PageBlock, { type: 'image' }> => b.type === 'image',
  );
}

/* ------------------------------------------------------------------ данные */

// rec735787688 — призыв «Получить консультацию»
const intro = texts('rec735787688');
// rec1376258911 — набор в предпрофессиональные 10-11 классы
const admission = texts('rec1376258911');
// rec1025633206 — инженерный класс
const engineering = texts('rec1025633206');
// rec911582704 — ТОП-170 и состав организации
const about = texts('rec911582704');
// rec741149702 / rec741199937 — визиты
const visitMayor = texts('rec741149702');
const visitGuest = texts('rec741199937');
// rec735798413 — вопросы родителей
const faqRaw = texts('rec735798413');

const faqItems = faqRaw.reduce<{ question: string; answer: string }[]>((acc, t, i) => {
  if (i % 2 === 0) acc.push({ question: t, answer: faqRaw[i + 1] ?? '' });
  return acc;
}, []);

/**
 * Фотография первого экрана. Взята из материалов действующего сайта:
 * школьное собрание, реальные ученики. Кадр горизонтальный, лица смещены
 * вправо и не попадают под текст (ТЗ §4, §5).
 */
const HERO_SRC = '/images/IMG_5183_7f54a7bc0a.webp';
const allImages = records.flatMap((r) => r.blocks).filter(
  (b): b is Extract<PageBlock, { type: 'image' }> => b.type === 'image',
);
const heroImage = allImages.find((b) => b.src === HERO_SRC) ?? allImages[0];

/** Цифры из текста блока «О школе» — значения не вычисляются, а взяты как есть. */
const stats = [
  { value: 'ТОП-170', label: 'лучших образовательных организаций' },
  { value: '10', label: 'уникальных учебных корпусов' },
  { value: '5', label: 'школьных корпусов' },
  { value: '5', label: 'дошкольных корпусов' },
];

export default function HomePage() {
  const title = 'ГБОУ Школа «Дмитровский» г. Москва';

  return (
    <>
      {/* --------------------------------------------------------- первый экран */}
      <section className={s.hero}>
        {heroImage ? (
          <div className={s.heroMedia}>
            <Image
              src={asset(heroImage.src)}
              alt=""
              width={heroImage.width}
              height={heroImage.height}
              priority
              sizes="100vw"
            />
          </div>
        ) : null}
        <div className={s.heroScrim} aria-hidden="true" />
        <Container>
          <div className={s.heroInner}>
            <h1 className={s.heroTitle}>{title}</h1>
            {admission[0] ? <p className={s.heroLead}>{admission[0]}</p> : null}
            <div className={s.heroActions}>
              <ButtonLink href="/10-11class" variant="primary" size="lg">
                Обучение в профильных 10 - 11 классах
                <Icon name="arrow-right" size={18} />
              </ButtonLink>
              <ButtonLink href="/contacts" variant="onDarkOutline" size="lg">
                Контакты
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------- о школе */}
      <Section tone="surface">
        <div className={s.aboutGrid}>
          <div>
            <SectionHead eyebrow="О школе" title={about[0] ?? ''} />
            {about.slice(1).map((t) => (
              <p key={t} className={s.aboutText}>
                {t}
              </p>
            ))}
          </div>
          <Stats items={stats} />
        </div>
      </Section>

      {/* ------------------------------------------------------------ приглашение */}
      {intro.length > 0 ? (
        <Section tone="dark">
          <div className={s.ctaGrid}>
            <div>
              <h2 className={s.ctaTitle}>{intro[0]}</h2>
              {intro.slice(1).map((t) => (
                <p key={t} className={s.ctaText}>
                  {t}
                </p>
              ))}
            </div>
            <div className={s.ctaActions}>
              <ButtonLink href="/contacts" variant="onDark" size="lg">
                Связаться со школой
              </ButtonLink>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------ направления */}
      {engineering.length > 0 ? (
        <Section>
          <SectionHead eyebrow="Набор" title="Инженерный класс" />
          <div className={s.textCols}>
            {engineering.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------------------------------------------------------------- визиты */}
      {visitMayor.length > 0 || visitGuest.length > 0 ? (
        <Section tone="muted">
          <SectionHead eyebrow="События" title="Школу посещали" />
          <div className={s.visitGrid}>
            {[
              { texts: visitMayor, imgs: images('rec741149702') },
              { texts: visitGuest, imgs: images('rec741199937') },
            ]
              .filter((v) => v.texts.length > 0)
              .map((v) => (
                <article key={v.texts[0]} className={s.visitCard}>
                  {v.imgs[0] ? (
                    <div className={s.visitMedia}>
                      <Image
                        src={asset(v.imgs[0].src)}
                        alt=""
                        width={v.imgs[0].width}
                        height={v.imgs[0].height}
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <p className={s.visitText}>{v.texts[0]}</p>
                </article>
              ))}
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------------- FAQ */}
      {faqItems.length > 0 ? (
        <Section tone="surface" narrow>
          <SectionHead eyebrow="Родителям" title="Отвечаем на популярные вопросы родителей" />
          <Accordion items={faqItems.map((f) => ({ question: f.question, answer: <p>{f.answer}</p> }))} />
        </Section>
      ) : null}

      {/* ---------------------------------------------------------------- новости */}
      <Section>
        <SectionHead eyebrow="Новости школы" title="Новости школы" />
        <Blocks blocks={(record('rec741130535')?.blocks ?? []).slice(0, 24)} />
      </Section>
    </>
  );
}
