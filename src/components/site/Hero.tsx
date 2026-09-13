import Image from 'next/image';
import type { ReactNode } from 'react';
import { Container } from '../layout/Container';
import type { ImageRef } from '@/content/types';
import s from './site.module.css';

type Props = {
  /** Главный смысл первого экрана — переносится с текущего сайта. */
  title: string;
  lead?: string;
  badge?: string;
  /** Реальная фотография школы или учеников (ТЗ §5). Стоки запрещены. */
  image?: ImageRef;
  actions?: ReactNode;
};

export function Hero({ title, lead, badge, image, actions }: Props) {
  return (
    <section className={s.hero}>
      {image ? (
        <div className={s.heroMedia}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority
            sizes="100vw"
          />
        </div>
      ) : null}
      <div className={s.heroScrim} aria-hidden="true" />
      <Container>
        <div className={s.heroInner}>
          <div className={s.heroContent}>
            {badge ? <span className={s.heroBadge}>{badge}</span> : null}
            <h1 className={s.heroTitle}>{title}</h1>
            {lead ? <p className={s.heroLead}>{lead}</p> : null}
            {actions ? <div className={s.heroActions}>{actions}</div> : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
