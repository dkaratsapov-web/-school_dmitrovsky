import Image from 'next/image';
import { RichText } from './RichText';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { asset } from '@/lib/asset';
import type { Offer } from '@/content/compositions';
import s from './compositions.module.css';

/**
 * Предложение по набору.
 *
 * На действующем сайте стоимость обучения набрана таким же абзацем, как
 * и всё остальное, а «Записаться на обучение» — просто строка текста.
 * Родителю приходится вычитывать цену из середины полосы, а записаться
 * по этой строке нельзя.
 *
 * Здесь то же содержимое разложено по назначению: подводка, цена отдельной
 * строкой, работающая кнопка записи на форму ниже и состав программы
 * перечнем. Формулировки перенесены дословно (ТЗ §7).
 */
export function OfferBlock({ offer }: { offer: Offer }) {
  return (
    <div className={s.offer}>
      <div className={s.offerMain}>
        {offer.lead.map((t) => (
          <p key={t} className={s.offerLead}>
            <RichText text={t} />
          </p>
        ))}

        {offer.price ? (
          <p className={s.offerPrice}>
            {offer.priceLabel ? <span className={s.offerPriceLabel}>{offer.priceLabel}</span> : null}
            <span className={s.offerPriceValue}>{offer.price}</span>
          </p>
        ) : null}

        {offer.ctaLabel && offer.ctaHref ? (
          <ButtonLink href={offer.ctaHref} variant="primary" size="lg">
            {offer.ctaLabel}
            <Icon name="arrow-right" size={18} />
          </ButtonLink>
        ) : offer.ctaLabel ? (
          <p className={s.offerLead}>{offer.ctaLabel}</p>
        ) : null}

        {offer.note ? (
          <p className={s.offerNote}>
            <RichText text={offer.note} />
          </p>
        ) : null}
      </div>

      <div className={s.offerAside}>
        {offer.image ? (
          <div className={s.offerMedia}>
            <Image
              src={asset(offer.image.src)}
              alt={offer.image.alt}
              width={offer.image.width}
              height={offer.image.height}
              sizes="(min-width: 900px) 45vw, 100vw"
            />
          </div>
        ) : null}

        {offer.program.length > 0 ? (
          <div className={s.offerProgram}>
            {offer.programTitle ? <h2 className={s.offerProgramTitle}>{offer.programTitle}</h2> : null}
            <ul className={s.offerProgramList}>
              {offer.program.map((item) => (
                <li key={item}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
