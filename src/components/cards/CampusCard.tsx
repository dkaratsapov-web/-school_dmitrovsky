import Image from 'next/image';
import { Card, CardBody, CardMedia, CardMeta, CardMetaItem, CardTitle } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';
import type { Campus } from '@/content/types';

/** Карточка корпуса: адрес и телефоны переносятся без изменений (ТЗ §7). */
export function CampusCard({ item }: { item: Campus }) {
  return (
    <Card>
      {item.image ? (
        <CardMedia>
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          />
        </CardMedia>
      ) : null}
      <CardBody>
        {item.kind ? (
          <CardMeta>
            <Tag>{item.kind}</Tag>
          </CardMeta>
        ) : null}
        <CardTitle>{item.title}</CardTitle>
        <CardMeta>
          <CardMetaItem>
            <Icon name="pin" size={16} />
            {item.address}
          </CardMetaItem>
        </CardMeta>
        {item.phones.length > 0 ? (
          <CardMeta>
            {item.phones.map((p) => (
              <CardMetaItem key={p.tel}>
                <Icon name="phone" size={16} />
                <a href={`tel:${p.tel}`}>{p.display}</a>
              </CardMetaItem>
            ))}
          </CardMeta>
        ) : null}
      </CardBody>
    </Card>
  );
}
