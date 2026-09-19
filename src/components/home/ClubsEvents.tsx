'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { clubGroups, clubs, clubsHref, events, eventsHref } from '@/content/clubs';
import type { Club, ClubGroup, EventItem } from '@/content/clubs';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './clubs-events.module.css';

type Filter = 'Все' | ClubGroup;

/** Что показываем в окне материала: и у кружка, и у мероприятия одно и то же. */
type Detail = {
  title: string;
  lead: string;
  text?: readonly string[];
  points?: readonly string[];
  facts?: readonly { label: string; value: string }[];
  signup?: string;
  /** Подпись на кнопке: у кружка запись, у мероприятия регистрация. */
  action: string;
};

function clubDetail(c: Club): Detail {
  return { title: c.title, lead: c.lead, text: c.text, points: c.points, facts: c.facts,
    signup: c.signup, action: 'Записаться на занятия' };
}

function eventDetail(e: EventItem): Detail {
  return { title: e.title, lead: e.text, text: e.full, points: e.points, facts: e.facts,
    signup: e.signup, action: 'Зарегистрироваться' };
}

const FILTERS: readonly Filter[] = ['Все', ...clubGroups];

/** Знак школы на месте афиши, пока её не передали. */
function Mark() {
  return (
    <svg className={s.mark} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="60" rx="50" ry="20" />
      <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(60 60 60)" />
      <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(120 60 60)" />
      <circle className={s.markCore} cx="60" cy="60" r="7" />
    </svg>
  );
}

/**
 * Кружки и мероприятия.
 *
 * Кружки фильтруются по возрастной группе — теми же вкладками, что
 * на странице кружков. Карточка с переданным материалом открывает окно
 * с полным описанием, расписанием, стоимостью и ссылкой на запись;
 * карточка-заготовка помечена и не открывается.
 *
 * Мероприятия идут строками: при наведении за курсором едет афиша
 * события — это и есть предпросмотр, вместо ряда одинаковых плиток.
 */
export function ClubsEvents() {
  const [filter, setFilter] = useState<Filter>('Все');
  /* Одно окно на кружок и на мероприятие: содержимое у них одинаковое. */
  const [open, setOpen] = useState<Detail | null>(null);
  const peekRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [peek, setPeek] = useState<number | null>(null);

  const shown = clubs.filter((c) => filter === 'Все' || c.groups.includes(filter));

  /* Афиша едет за курсором: координаты пишем в стиль, без состояния. */
  const movePeek = (e: React.PointerEvent<HTMLUListElement>) => {
    const box = listRef.current;
    const el = peekRef.current;
    if (!box || !el || e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const r = box.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <section className={s.section} aria-labelledby="clubs-title">
      <div className={s.inner}>
        <div className={s.head}>
          <div>
            <h2 id="clubs-title" className={s.title}>
              Кружки и мероприятия
            </h2>
            <p className={s.lead}>
              Дополнительное образование школы: занятия по возрастным группам и ближайшие события.
            </p>
          </div>

          <Link className={s.all} href={clubsHref}>
            <span>Все кружки</span>
            <span className={s.allRule} aria-hidden="true" />
          </Link>
        </div>

        {/* ------------------------------------------------------- вкладки */}
        <div className={s.tabs} role="tablist" aria-label="Возрастные группы">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={[s.tab, f === filter ? s.tabOn : ''].filter(Boolean).join(' ')}
              type="button"
              role="tab"
              aria-selected={f === filter}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------ карточки */}
        <ul className={s.grid}>
          {shown.map((club, i) => (
            <li className={s.card} key={`${club.title}-${i}`} style={{ '--i': i } as React.CSSProperties}>
              <button
                className={[s.face, club.draft ? s.faceDraft : ''].filter(Boolean).join(' ')}
                type="button"
                disabled={club.draft}
                onClick={() => setOpen(clubDetail(club))}
              >
                <span className={s.shot}>
                  {club.image ? (
                    <Image
                      className={s.photo}
                      src={asset(club.image.src)}
                      alt={club.image.alt}
                      width={club.image.width}
                      height={club.image.height}
                      sizes="(min-width: 1024px) 380px, 90vw"
                    />
                  ) : (
                    <Mark />
                  )}
                  <span className={s.corner} aria-hidden="true" />
                </span>

                <span className={s.body}>
                  <span className={s.groups}>
                    {club.groups.map((g) => (
                      <span className={s.group} key={g}>
                        {g}
                      </span>
                    ))}
                  </span>

                  <span className={s.cardTitle}>{club.title}</span>
                  <span className={s.cardText}>{club.lead}</span>

                  {club.facts ? (
                    <span className={s.facts}>
                      {club.facts.slice(0, 2).map((f) => (
                        <span className={s.fact} key={f.label}>
                          <span className={s.factLabel}>{f.label}</span>
                          <span className={s.factValue}>{f.value}</span>
                        </span>
                      ))}
                    </span>
                  ) : null}

                  {club.draft ? null : <span className={s.more}>Подробнее</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* ---------------------------------------------------- мероприятия */}
        <div className={s.events}>
          <div className={s.eventsHead}>
            <h3 className={s.eventsTitle}>Ближайшие мероприятия</h3>
            <Link className={s.all} href={eventsHref}>
              <span>Все мероприятия</span>
              <span className={s.allRule} aria-hidden="true" />
            </Link>
          </div>

          <ul
            className={s.eventList}
            ref={listRef}
            onPointerMove={movePeek}
            onPointerLeave={() => setPeek(null)}
          >
            {events.map((e, i) => {
              const body = (
                <>
                  <span className={s.eventNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.eventBody}>
                    <span className={s.eventTitle}>{e.title}</span>
                    <span className={s.eventText}>{e.text}</span>
                  </span>
                </>
              );

              return (
                <li key={e.title}>
                  {e.full ? (
                    /* материал передан целиком — открываем окно */
                    <button
                      className={s.event}
                      type="button"
                      onPointerEnter={() => setPeek(i)}
                      onFocus={() => setPeek(i)}
                      onClick={() => setOpen(eventDetail(e))}
                    >
                      {body}
                    </button>
                  ) : (
                    <Link
                      className={s.event}
                      href={eventsHref}
                      onPointerEnter={() => setPeek(i)}
                      onFocus={() => setPeek(i)}
                    >
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}

            {/* афиша едет за курсором */}
            <span
              className={[s.peek, peek === null ? '' : s.peekOn].filter(Boolean).join(' ')}
              ref={peekRef}
              aria-hidden="true"
            >
              {events.map((e, i) => (
                <Image
                  key={e.image.src}
                  className={[s.peekImage, i === peek ? s.peekImageOn : ''].filter(Boolean).join(' ')}
                  src={asset(e.image.src)}
                  alt=""
                  width={e.image.width}
                  height={e.image.height}
                  sizes="220px"
                />
              ))}
            </span>
          </ul>
        </div>
      </div>

      {/* ----------------------------------------------- окно кружка */}
      <CallbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        text={open?.lead ?? ''}
        wide
      >
        <div className={s.detail}>
          {open?.text?.map((para) => (
            <p className={s.detailText} key={para}>
              {para}
            </p>
          ))}

          {open?.points?.length ? (
            <ul className={s.detailList}>
              {open.points.map((p) => (
                <li className={s.detailPoint} key={p}>
                  {p}
                </li>
              ))}
            </ul>
          ) : null}

          {open?.facts?.length ? (
            <dl className={s.detailFacts}>
              {open.facts.map((f) => (
                <div className={s.detailFact} key={f.label}>
                  <dt className={s.detailFactLabel}>{f.label}</dt>
                  <dd className={s.detailFactValue}>{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {open?.signup ? (
            <a className={s.signup} href={open.signup} target="_blank" rel="noopener noreferrer">
              {open.action}
            </a>
          ) : null}
        </div>
      </CallbackModal>
    </section>
  );
}
