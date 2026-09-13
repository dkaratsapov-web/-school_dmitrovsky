import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFoot, CardMedia, CardText, CardTitle, cardStyles } from '../ui/Card';
import { Icon } from '../ui/Icon';
import type { ProgramItem } from '@/content/types';

/** Карточка направления обучения (1–4, 5–8, 9, 10–11, дошколка, кадеты). */
export function ProgramCard({ item }: { item: ProgramItem }) {
  const linkable = item.href !== null;
  return (
    <Card interactive={linkable}>
      {item.cover ? (
        <CardMedia>
          <Image
            src={item.cover.src}
            alt={item.cover.alt}
            width={item.cover.width}
            height={item.cover.height}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          />
        </CardMedia>
      ) : null}
      <CardBody>
        <CardTitle>
          {linkable ? (
            <Link
              href={item.href ?? '/'}
              className={cardStyles.stretched}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </CardTitle>
        {item.summary ? <CardText>{item.summary}</CardText> : null}
        {linkable ? (
          <CardFoot>
            <span className={cardStyles.cardLink}>
              Подробнее
              <Icon name="arrow-right" size={18} />
            </span>
          </CardFoot>
        ) : null}
      </CardBody>
    </Card>
  );
}
