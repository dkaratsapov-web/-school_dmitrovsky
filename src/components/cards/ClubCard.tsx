import Image from 'next/image';
import { Card, CardBody, CardMedia, CardMeta, CardMetaItem, CardText, CardTitle } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';
import type { ClubItem } from '@/content/types';

/** Карточка кружка. Возраст, расписание и стоимость — как опубликовано сейчас. */
export function ClubCard({ item }: { item: ClubItem }) {
  return (
    <Card>
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
        {item.ageText ? (
          <CardMeta>
            <Tag tone="accent">{item.ageText}</Tag>
          </CardMeta>
        ) : null}
        <CardTitle>{item.title}</CardTitle>
        {item.description ? <CardText>{item.description}</CardText> : null}
        {item.scheduleText || item.priceText ? (
          <CardMeta>
            {item.scheduleText ? (
              <CardMetaItem>
                <Icon name="clock" size={16} />
                {item.scheduleText}
              </CardMetaItem>
            ) : null}
            {item.priceText ? <CardMetaItem>{item.priceText}</CardMetaItem> : null}
          </CardMeta>
        ) : null}
      </CardBody>
    </Card>
  );
}
