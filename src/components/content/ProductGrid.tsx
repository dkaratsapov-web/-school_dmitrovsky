import Image from 'next/image';
import { asset } from '@/lib/asset';
import type { Product } from '@/content/compositions';
import s from './compositions.module.css';

/**
 * Каталог мерча.
 *
 * Вместо сплошной ленты снимков — карточка на товар: главная фотография,
 * остальные ракурсы мелкими плитками, название и состав. Тексты взяты
 * из каталога и попапа действующего сайта без изменений (ТЗ §7).
 *
 * Цена не выводится: на действующем сайте блок цены скрыт стилями и пуст —
 * см. QUESTIONS.md.
 */
export function ProductGrid({ items }: { items: readonly Product[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={s.products}>
      {items.map((p) => {
        const [cover, ...rest] = p.images;
        return (
          <li key={p.title} className={s.product}>
            <article className={s.productCard}>
              {cover ? (
                <div className={s.productMedia}>
                  <Image
                    src={asset(cover.src)}
                    alt={cover.alt}
                    width={cover.width}
                    height={cover.height}
                    sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 90vw"
                  />
                </div>
              ) : null}

              <div className={s.productBody}>
                <h2 className={s.productTitle}>{p.title}</h2>
                {p.description ? <p className={s.productText}>{p.description}</p> : null}

                {rest.length > 0 ? (
                  <div className={s.productThumbs}>
                    {rest.map((img) => (
                      <Image
                        key={img.src}
                        src={asset(img.src)}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        sizes="80px"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
