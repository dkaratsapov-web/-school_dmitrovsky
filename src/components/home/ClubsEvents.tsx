'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { clubs, clubsHref, events, eventsHref } from '@/content/clubs';
import type { Club, EventItem } from '@/content/clubs';
import { asset } from '@/lib/asset';
import s from './clubs-events.module.css';

type Tab = 'clubs' | 'events';

/** Что показываем в окне: у кружка и у мероприятия содержимое одинаковое. */
type Detail = {
  title: string;
  lead: string;
  text?: readonly string[];
  points?: readonly string[];
  facts?: readonly { label: string; value: string }[];
  signup?: string;
  image?: { src: string; width: number; height: number; alt: string };
  action: string;
};

/** Плитка стены: у кружка метка — возраст, у мероприятия — дата. */
type Tile = {
  title: string;
  lead: string;
  chip?: string;
  image?: { src: string; width: number; height: number; alt: string };
  detail?: Detail;
  draft?: boolean;
};

function clubTile(c: Club): Tile {
  const tile: Tile = {
    title: c.title,
    lead: c.lead,
    chip: c.groups.join(', '),
    ...(c.image ? { image: c.image } : {}),
    ...(c.draft ? { draft: true } : {}),
  };
  if (c.draft) return tile;
  return {
    ...tile,
    detail: {
      title: c.title,
      lead: c.lead,
      ...(c.text ? { text: c.text } : {}),
      ...(c.points ? { points: c.points } : {}),
      ...(c.facts ? { facts: c.facts } : {}),
      ...(c.signup ? { signup: c.signup } : {}),
      ...(c.image ? { image: c.image } : {}),
      action: 'Записаться на занятия',
    },
  };
}

function eventTile(e: EventItem): Tile {
  const tile: Tile = {
    title: e.title,
    lead: e.text,
    ...(e.when ? { chip: e.when } : {}),
    image: e.image,
  };
  if (!e.full) return tile;
  return {
    ...tile,
    detail: {
      title: e.title,
      lead: e.text,
      text: e.full,
      ...(e.points ? { points: e.points } : {}),
      ...(e.facts ? { facts: e.facts } : {}),
      ...(e.signup ? { signup: e.signup } : {}),
      image: e.image,
      action: 'Зарегистрироваться',
    },
  };
}

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
 * Кружки и мероприятия — стена афиш.
 *
 * Афиши школа рисует сама, поэтому плитка отдана им целиком: кадр во всю
 * площадь, название поверх затемнения, метка в углу — возраст у кружка,
 * дата у мероприятия. Рамок и белых подложек нет: они бы спорили
 * с самими афишами.
 *
 * Переключатель наверху меняет раздел. Плитки при этом перекладываются
 * по очереди — это единственное движение, которое запускается само.
 * Остальное отвечает на действие: нажатие открывает окно материала.
 */
export function ClubsEvents() {
  const [tab, setTab] = useState<Tab>('clubs');
  const [open, setOpen] = useState<Detail | null>(null);

  const tiles: Tile[] = tab === 'clubs' ? clubs.map(clubTile) : events.map(eventTile);
  const href = tab === 'clubs' ? clubsHref : eventsHref;
  const hrefLabel = tab === 'clubs' ? 'Все кружки' : 'Все мероприятия';

  return (
    <section className={s.section} aria-labelledby="clubs-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="clubs-title" className={s.title}>
            Кружки и мероприятия
          </h2>

          <div className={s.switch} role="tablist" aria-label="Разделы">
            <span className={[s.slider, tab === 'events' ? s.sliderRight : ''].filter(Boolean).join(' ')} aria-hidden="true" />
            <button
              className={[s.tab, tab === 'clubs' ? s.tabOn : ''].filter(Boolean).join(' ')}
              type="button"
              role="tab"
              aria-selected={tab === 'clubs'}
              onClick={() => setTab('clubs')}
            >
              Кружки
              <span className={s.count}>{clubs.length}</span>
            </button>
            <button
              className={[s.tab, tab === 'events' ? s.tabOn : ''].filter(Boolean).join(' ')}
              type="button"
              role="tab"
              aria-selected={tab === 'events'}
              onClick={() => setTab('events')}
            >
              Мероприятия
              <span className={s.count}>{events.length}</span>
            </button>
          </div>
        </div>

        <ul className={s.wall} key={tab}>
          {tiles.map((t, i) => {
            const inner = (
              <>
                <span className={s.shot}>
                  {t.image ? (
                    <Image
                      className={s.photo}
                      src={asset(t.image.src)}
                      alt={t.image.alt}
                      width={t.image.width}
                      height={t.image.height}
                      sizes="(min-width: 1500px) 24vw, (min-width: 1100px) 32vw, (min-width: 640px) 46vw, 92vw"
                    />
                  ) : (
                    <Mark />
                  )}
                  <span className={s.veil} aria-hidden="true" />
                </span>

                {t.chip ? <span className={s.chip}>{t.chip}</span> : null}

                <span className={s.words}>
                  <span className={s.rule} aria-hidden="true" />
                  <span className={s.tileTitle}>{t.title}</span>
                  <span className={s.tileLead}>{t.lead}</span>
                </span>
              </>
            );

            return (
              <li
                className={[s.tile, t.draft ? s.tileDraft : ''].filter(Boolean).join(' ')}
                key={`${t.title}-${i}`}
                style={{ '--i': i } as React.CSSProperties}
              >
                {t.detail ? (
                  <button className={s.face} type="button" onClick={() => setOpen(t.detail ?? null)}>
                    {inner}
                  </button>
                ) : (
                  <span className={s.face}>{inner}</span>
                )}
              </li>
            );
          })}
        </ul>

        <Link className={s.all} href={href}>
          <span>{hrefLabel}</span>
          <span className={s.allRule} aria-hidden="true" />
        </Link>
      </div>

      {/* ----------------------------------------------- окно материала */}
      <CallbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        text={open?.lead ?? ''}
        wide
      >
        <div className={s.detail}>
          {open?.image ? (
            <Image
              className={s.detailShot}
              src={asset(open.image.src)}
              alt={open.image.alt}
              width={open.image.width}
              height={open.image.height}
              sizes="(min-width: 640px) 560px, 88vw"
            />
          ) : null}

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
