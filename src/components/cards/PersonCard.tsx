import Image from 'next/image';
import { Card, CardBody, CardMedia, CardMeta, CardMetaItem, CardTitle } from '../ui/Card';
import { Icon } from '../ui/Icon';
import type { PersonItem } from '@/content/types';

/** Карточка сотрудника. ФИО и должность — дословно. */
export function PersonCard({ item }: { item: PersonItem }) {
  return (
    <Card>
      {item.photo ? (
        <CardMedia>
          <Image
            src={item.photo.src}
            alt={item.photo.alt}
            width={item.photo.width}
            height={item.photo.height}
            sizes="(min-width: 1024px) 300px, 50vw"
          />
        </CardMedia>
      ) : null}
      <CardBody>
        <CardTitle>{item.name}</CardTitle>
        <CardMeta>
          <CardMetaItem>{item.role}</CardMetaItem>
        </CardMeta>
        {item.phone || item.email ? (
          <CardMeta>
            {item.phone ? (
              <CardMetaItem>
                <Icon name="phone" size={16} />
                <a href={`tel:${item.phone.tel}`}>{item.phone.display}</a>
              </CardMetaItem>
            ) : null}
            {item.email ? (
              <CardMetaItem>
                <Icon name="mail" size={16} />
                <a href={`mailto:${item.email}`}>{item.email}</a>
              </CardMetaItem>
            ) : null}
          </CardMeta>
        ) : null}
      </CardBody>
    </Card>
  );
}
