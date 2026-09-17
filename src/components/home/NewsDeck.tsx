'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';
import { news, newsHref } from '@/content/news';
import { asset } from '@/lib/asset';
import s from './news-deck.module.css';

/** Заглушка на месте ролика: знак школы, без выдуманной картинки. */
function Placeholder() {
  return (
    <span className={s.stub} aria-hidden="true">
      <svg className={s.stubMark} viewBox="0 0 120 120">
        <ellipse cx="60" cy="60" rx="52" ry="21" />
        <ellipse cx="60" cy="60" rx="52" ry="21" transform="rotate(60 60 60)" />
        <ellipse cx="60" cy="60" rx="52" ry="21" transform="rotate(120 60 60)" />
        <circle className={s.stubCore} cx="60" cy="60" r="8" />
      </svg>
    </span>
  );
}

/**
 * Обновления школы.
 *
 * Слева крупный материал, справа список остальных. Выбор материала
 * меняет крупный кадр не подменой картинки, а затвором: бордовая
 * полоса проходит поперёк кадра, и за ней открывается новый снимок,
 * а строки заголовка поднимаются из-под маски.
 *
 * Список работает как набор вкладок: доступен с клавиатуры, активный
 * пункт помечен для чтения с экрана. Материалы никуда не спрятаны —
 * на странице «Мероприятия» тот же список целиком.
 */
export function NewsDeck() {
  const [active, setActive] = useState(0);
  const uid = useId();
  const item = news[active] ?? news[0];
  if (!item) return null;

  /* Пока материал один, список выбора не нужен: крупный кадр встаёт
     рядом с текстом, а не оставляет пустую колонку. */
  const single = news.length < 2;

  return (
    <section className={s.section} aria-labelledby="news-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="news-title" className={s.title}>
            Обновления школы
          </h2>
          <Link className={s.all} href={newsHref}>
            <span>Все мероприятия</span>
            <span className={s.allRule} aria-hidden="true" />
          </Link>
        </div>

        <div className={[s.deck, single ? s.deckSingle : ''].filter(Boolean).join(' ')}>
          {/* ---------------------------------------------- крупный материал */}
          <div
            className={s.feature}
            id={single ? undefined : `${uid}-panel`}
            role={single ? undefined : 'tabpanel'}
            aria-labelledby={single ? undefined : `${uid}-tab-${active}`}
          >
            <div className={s.frame}>
              {news.map((n, i) => (
                <span
                  className={[s.plate, i === active ? s.plateOn : ''].filter(Boolean).join(' ')}
                  key={n.title}
                  aria-hidden={i === active ? undefined : 'true'}
                >
                  {n.image ? (
                    <Image
                      className={s.photo}
                      src={asset(n.image.src)}
                      alt={i === active ? n.image.alt : ''}
                      width={n.image.width}
                      height={n.image.height}
                      sizes="(min-width: 1024px) 58vw, 92vw"
                    />
                  ) : (
                    <Placeholder />
                  )}
                </span>
              ))}

              {/* затвор: полоса проходит поперёк кадра при смене материала */}
              <span className={s.shutter} key={active} aria-hidden="true" />
            </div>

            <div className={s.words} key={`w-${active}`}>
              <h3 className={s.featureTitle}>{item.title}</h3>
              {item.text ? <p className={s.featureText}>{item.text}</p> : null}
              {item.phone ? (
                <a className={s.phone} href={`tel:${item.phone.tel}`}>
                  {item.phone.display}
                </a>
              ) : null}
            </div>
          </div>

          {/* ------------------------------------------------------- список */}
          {single ? null : (
          <div className={s.list} role="tablist" aria-orientation="vertical" aria-label="Обновления">
            {news.map((n, i) => (
              <button
                key={n.title}
                id={`${uid}-tab-${i}`}
                className={[s.row, i === active ? s.rowOn : ''].filter(Boolean).join(' ')}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls={`${uid}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    setActive((i + 1) % news.length);
                  }
                  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setActive((i - 1 + news.length) % news.length);
                  }
                }}
              >
                <span className={s.rowNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.rowTitle}>{n.title}</span>
                <span className={s.rowBar} aria-hidden="true" />
              </button>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
