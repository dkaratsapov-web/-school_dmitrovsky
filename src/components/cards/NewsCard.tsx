import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFoot, CardMedia, CardMeta, CardMetaItem, CardText, CardTitle, cardStyles } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';
import { formatDate } from '@/lib/format';
import type { NewsItem } from '@/content/types';

/** Карточка новости. Заголовок, дата и анонс выводятся как есть. */
export function NewsCard({ item, href }: { item: NewsItem; href: string }) {
  return (
    <Card interactive>
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
        <CardMeta>
          <CardMetaItem>
            <Icon name="calendar" size={16} />
            <time dateTime={item.date}>{formatDate(item.date)}</time>
          </CardMetaItem>
          {item.tags?.map((t) => <Tag key={t} tone="neutral">{t}</Tag>)}
        </CardMeta>
        <CardTitle>
          <Link href={href} className={cardStyles.stretched} style={{ textDecoration: 'none', color: 'inherit' }}>
            {item.title}
          </Link>
        </CardTitle>
        {item.excerpt ? <CardText>{item.excerpt}</CardText> : null}
        <CardFoot>
          <span className={cardStyles.cardLink}>
            Читать
            <Icon name="arrow-right" size={18} />
          </span>
        </CardFoot>
      </CardBody>
    </Card>
  );
}
