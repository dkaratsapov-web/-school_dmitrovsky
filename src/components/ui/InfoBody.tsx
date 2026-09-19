import Image from 'next/image';
import { asset } from '@/lib/asset';
import s from './info-body.module.css';

export type InfoContent = {
  text?: readonly string[];
  points?: readonly string[];
  facts?: readonly { label: string; value: string }[];
  image?: { src: string; width: number; height: number; alt: string };
  /** Внешняя ссылка — запись, регистрация, документ. */
  link?: { label: string; href: string };
};

/**
 * Содержимое окна материала: снимок, абзацы, список, факты и ссылка.
 *
 * Один и тот же вид у кружка, мероприятия, ступени обучения и профиля —
 * поэтому разметка и стили живут в одном месте, а не копируются по блокам.
 */
export function InfoBody({ text, points, facts, image, link }: InfoContent) {
  return (
    <div className={s.body}>
      {image ? (
        <Image
          className={s.shot}
          src={asset(image.src)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 640px) 560px, 88vw"
        />
      ) : null}

      {text?.map((para) => (
        <p className={s.text} key={para}>
          {para}
        </p>
      ))}

      {points?.length ? (
        <ul className={s.list}>
          {points.map((p) => (
            <li className={s.point} key={p}>
              {p}
            </li>
          ))}
        </ul>
      ) : null}

      {facts?.length ? (
        <dl className={s.facts}>
          {facts.map((f) => (
            <div className={s.fact} key={f.label}>
              <dt className={s.factLabel}>{f.label}</dt>
              <dd className={s.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {link ? (
        <a className={s.link} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      ) : null}
    </div>
  );
}
