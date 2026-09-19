'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { news } from '@/content/news';
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
 * Все присланные снимки материала доступны: первый показан крупно,
 * остальные переключаются рядом под кадром — тем же затвором.
 *
 * Список работает как набор вкладок: доступен с клавиатуры, активный
 * пункт помечен для чтения с экрана. Материалы никуда не спрятаны —
 * на странице «Мероприятия» тот же список целиком.
 */
export function NewsDeck() {
  const [active, setActive] = useState(0);
  /* Какой снимок материала показан крупно. */
  const [shot, setShot] = useState(0);
  const uid = useId();
  const item = news[active] ?? news[0];
  if (!item) return null;

  /* Пока материал один, список выбора не нужен: крупный кадр встаёт
     рядом с текстом, а не оставляет пустую колонку. */
  const single = news.length < 2;
  const shots = item.images ?? [];

  const pick = (i: number) => {
    setActive(i);
    setShot(0);
  };

  return (
    <section className={s.section} id="news" aria-labelledby="news-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="news-title" className={s.title}>
            Новости школы
          </h2>
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
              {shots.length > 0 ? (
                shots.map((im, i) => (
                  <span
                    className={[s.plate, i === shot ? s.plateOn : ''].filter(Boolean).join(' ')}
                    key={im.src}
                    aria-hidden={i === shot ? undefined : 'true'}
                  >
                    <Image
                      className={s.photo}
                      src={asset(im.src)}
                      alt={i === shot ? im.alt : ''}
                      width={im.width}
                      height={im.height}
                      sizes="(min-width: 1024px) 58vw, 92vw"
                    />
                  </span>
                ))
              ) : (
                <span className={[s.plate, s.plateOn].join(' ')}>
                  <Placeholder />
                </span>
              )}

              {/* затвор: полоса проходит поперёк кадра при смене снимка */}
              <span className={s.shutter} key={`${active}-${shot}`} aria-hidden="true" />
            </div>

            {shots.length > 1 ? (
              <div className={s.thumbs}>
                {shots.map((im, i) => (
                  <button
                    key={im.src}
                    className={[s.thumb, i === shot ? s.thumbOn : ''].filter(Boolean).join(' ')}
                    type="button"
                    onClick={() => setShot(i)}
                    aria-label={`Снимок ${i + 1} из ${shots.length}`}
                    aria-current={i === shot ? 'true' : undefined}
                  >
                    <Image
                      className={s.thumbImage}
                      src={asset(im.src)}
                      alt=""
                      width={im.width}
                      height={im.height}
                      sizes="140px"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <div className={s.words} key={`w-${active}`}>
              <h3 className={s.featureTitle}>{item.title}</h3>
              {item.text?.map((para) => (
                <p className={s.featureText} key={para}>
                  {para}
                </p>
              ))}

              {item.links?.length ? (
                <ul className={s.links}>
                  {item.links.map((l) => (
                    <li key={l.href}>
                      <a
                        className={s.link}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
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
                onClick={() => pick(i)}
                onMouseEnter={() => pick(i)}
                onFocus={() => pick(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    pick((i + 1) % news.length);
                  }
                  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    pick((i - 1 + news.length) % news.length);
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
