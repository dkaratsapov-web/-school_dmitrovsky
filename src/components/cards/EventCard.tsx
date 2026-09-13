import Image from 'next/image';
import { Card, CardBody, CardMedia, CardMeta, CardMetaItem, CardText, CardTitle } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { formatDate } from '@/lib/format';
import type { EventItem } from '@/content/types';

/** Карточка мероприятия. Дата, время и место — в текущей формулировке. */
export function EventCard({ item }: { item: EventItem }) {
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
        <CardMeta>
          <CardMetaItem>
            <Icon name="calendar" size={16} />
            <time dateTime={item.date}>{formatDate(item.date)}</time>
          </CardMetaItem>
          {item.timeText ? (
            <CardMetaItem>
              <Icon name="clock" size={16} />
              {item.timeText}
            </CardMetaItem>
          ) : null}
        </CardMeta>
        <CardTitle>{item.title}</CardTitle>
        {item.place ? (
          <CardMeta>
            <CardMetaItem>
              <Icon name="pin" size={16} />
              {item.place}
            </CardMetaItem>
          </CardMeta>
        ) : null}
        {item.description ? <CardText>{item.description}</CardText> : null}
      </CardBody>
    </Card>
  );
}
