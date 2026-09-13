import { RichText } from './RichText';
import type { InfoCard } from '@/content/compositions';
import s from './compositions.module.css';

/** Цена вида «15 000 рублей в месяц» — выносится в отдельную строку карточки. */
const PRICE = /^[\d\s ]+(руб|₽)/i;

/**
 * Карточки с перечнем: тарифы детского сада, преимущества направлений.
 *
 * В исходнике это раскрывающиеся полосы Tilda — цена, заголовок и список.
 * Читать их приходилось по одной; здесь они стоят рядом, и тарифы можно
 * сравнить. Состав и формулировки не меняются (ТЗ §7).
 */
export function InfoCards({ items }: { items: readonly InfoCard[] }) {
  if (items.length === 0) return null;
  const withPrice = items.some((c) => c.label !== undefined && PRICE.test(c.label));

  return (
    <ul className={[s.cards, withPrice ? s.cardsTariff : ''].filter(Boolean).join(' ')}>
      {items.map((card) => (
        <li key={card.title} className={s.infoCard}>
          <article className={s.infoCardInner}>
            <h3 className={s.infoTitle}>{card.title}</h3>
            {card.label ? (
              <p className={PRICE.test(card.label) ? s.infoPrice : s.infoLabel}>{card.label}</p>
            ) : null}
            <ul className={s.infoList}>
              {card.items.map((it) => (
                <li key={it}>
                  <RichText text={it} />
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ul>
  );
}
