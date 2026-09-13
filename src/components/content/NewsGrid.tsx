import Image from 'next/image';
import { asset } from '@/lib/asset';
import type { NewsItem } from '@/content/compositions';
import s from './compositions.module.css';

/**
 * Первый абзац публикации служит заголовком карточки, но только если он
 * короткий. У части новостей там сразу основной текст — делать из него
 * заголовок нельзя, он выводится абзацем. Формулировки не меняются.
 */
const HEADING_LIMIT = 90;

/**
 * Лента новостей.
 *
 * На действующем сайте публикации идут сплошной колонкой: снимок во всю
 * ширину, под ним заголовок и текст. Здесь то же содержимое разложено
 * карточками — заголовок виден сразу, а не после прокрутки очередной
 * фотографии. Тексты перенесены дословно (ТЗ §7).
 */
export function NewsGrid({ items }: { items: readonly NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={s.news}>
      {items.map((item, i) => {
        const cover = item.images[0];
        return (
          <li key={`${item.title}-${i}`} className={s.newsItem}>
            <article className={s.newsCard}>
              {cover ? (
                <div className={s.newsMedia}>
                  <Image
                    src={asset(cover.src)}
                    alt={cover.alt}
                    width={cover.width}
                    height={cover.height}
                    sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 90vw"
                  />
                  {item.images.length > 1 ? (
                    <span className={s.newsCount}>{item.images.length} фото</span>
                  ) : null}
                </div>
              ) : null}

              <div className={s.newsBody}>
                {item.title ? (
                  item.title.length <= HEADING_LIMIT ? (
                    <h3 className={s.newsTitle}>{item.title}</h3>
                  ) : (
                    <p className={s.newsText}>{item.title}</p>
                  )
                ) : null}
                {item.excerpt ? <p className={s.newsText}>{item.excerpt}</p> : null}
                {item.points.length > 0 ? (
                  <ul className={s.newsPoints}>
                    {item.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
