import type { ElementType, ReactNode } from 'react';
import s from './ui.module.css';

type CardProps = {
  children: ReactNode;
  /** Вся карточка ведёт по ссылке — добавляет hover и подъём. */
  interactive?: boolean;
  as?: ElementType;
  className?: string;
};

export function Card({ children, interactive = false, as: Tag = 'article', className }: CardProps) {
  return (
    <Tag className={[s.card, interactive ? s.cardInteractive : '', className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}

export function CardMedia({ children }: { children: ReactNode }) {
  return <div className={s.cardMedia}>{children}</div>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className={s.cardBody}>{children}</div>;
}

export function CardTitle({ children, as: Tag = 'h3' }: { children: ReactNode; as?: ElementType }) {
  return <Tag className={s.cardTitle}>{children}</Tag>;
}

export function CardText({ children }: { children: ReactNode }) {
  return <p className={s.cardText}>{children}</p>;
}

export function CardMeta({ children }: { children: ReactNode }) {
  return <div className={s.cardMeta}>{children}</div>;
}

export function CardMetaItem({ children }: { children: ReactNode }) {
  return <span className={s.cardMetaItem}>{children}</span>;
}

export function CardFoot({ children }: { children: ReactNode }) {
  return <div className={s.cardFoot}>{children}</div>;
}

export const cardStyles = s;
