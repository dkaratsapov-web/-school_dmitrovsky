'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { clubGroups, clubs, events } from '@/content/clubs';
import type { Club, ClubGroup, EventItem } from '@/content/clubs';
import { InfoBody } from '../ui/InfoBody';
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
  phones?: readonly string[];
  image?: { src: string; width: number; height: number; alt: string };
  /** Снимки занятий: показываются в окне вслед за афишей. */
  gallery?: readonly { src: string; width: number; height: number; alt: string }[];
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

/**
 * Метка возраста в углу афиши.
 *
 * Кружки идут сразу в нескольких группах, и полный перечень
 * «1-4 класс, 5-8 класс, 9 класс, 10-11 класс» в угловую метку не влезает.
 * Поэтому слово «класс» остаётся один раз в конце, а весь набор групп
 * сворачивается в «Все классы».
 */
function groupChip(groups: readonly ClubGroup[]): string {
  if (groups.length >= clubGroups.length) return 'Все классы';
  const parts = groups.map((g) => g.replace(' класс', ''));
  return `${parts.join(', ')} класс`;
}

function clubTile(c: Club): Tile {
  const tile: Tile = {
    title: c.title,
    lead: c.lead,
    chip: groupChip(c.groups),
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
      ...(c.phones ? { phones: c.phones } : {}),
      ...(c.image ? { image: c.image } : {}),
      ...(c.gallery ? { gallery: c.gallery } : {}),
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
 * Счётчиков у разделов нет: один кружок идёт сразу в нескольких классах,
 * и общее число карточек больше числа кружков — такая цифра вводит
 * в заблуждение.
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
type Props = {
  /** Подмена материалов: админка показывает в превью один кружок. */
  clubsData?: readonly Club[];
  eventsData?: readonly EventItem[];
  /** Раздел и класс, с которых открывается блок. */
  startTab?: Tab;
  startGroup?: ClubGroup;
  /** Превью: заголовок и переключатели не нужны, важна одна плитка. */
  bare?: boolean;
};

export function ClubsEvents({
  clubsData = clubs,
  eventsData = events,
  startTab = 'clubs',
  startGroup,
  bare = false,
}: Props = {}) {
  const [tab, setTab] = useState<Tab>(startTab);
  /* Разбивка по классам без общей вкладки: раздел открывается
     на младших классах, остальные группы рядом. */
  const [group, setGroup] = useState<ClubGroup>(startGroup ?? clubGroups[0] ?? '');
  const [open, setOpen] = useState<Detail | null>(null);

  /* Пункты меню ведут на #clubs и #events — раздел подстраивается под адрес.
     Проверка отложена на кадр, чтобы не менять состояние в теле эффекта. */
  useEffect(() => {
    if (bare) return;
    const apply = () => {
      if (window.location.hash === '#events') setTab('events');
      if (window.location.hash === '#clubs') setTab('clubs');
    };
    const id = window.setTimeout(apply, 0);
    window.addEventListener('hashchange', apply);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('hashchange', apply);
    };
  }, [bare]);

  const tiles: Tile[] =
    tab === 'clubs'
      ? clubsData.filter((c) => bare || c.groups.includes(group)).map(clubTile)
      : eventsData.map(eventTile);

  return (
    <section
      className={[s.section, bare ? s.bare : ''].filter(Boolean).join(' ')}
      id="clubs"
      {...(bare ? { 'aria-label': 'Превью материала' } : { 'aria-labelledby': 'clubs-title' })}
    >
      <div className={s.inner}>
        {bare ? null : (
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
              </button>
              <button
                className={[s.tab, tab === 'events' ? s.tabOn : ''].filter(Boolean).join(' ')}
                type="button"
                role="tab"
                aria-selected={tab === 'events'}
                onClick={() => setTab('events')}
              >
                Мероприятия
              </button>
            </div>
          </div>
        )}

        {/* второй уровень: кружки разбиты по классам */}
        {tab === 'clubs' && !bare ? (
          <div className={s.groups} role="tablist" aria-label="Классы">
            {clubGroups.map((g) => (
              <button
                key={g}
                className={[s.group, g === group ? s.groupOn : ''].filter(Boolean).join(' ')}
                type="button"
                role="tab"
                aria-selected={g === group}
                onClick={() => setGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        ) : null}

        <span className={s.anchor} id="events" aria-hidden="true" />

        <ul className={s.wall} key={`${tab}-${group}`}>
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
                      sizes="(min-width: 1440px) 19vw, (min-width: 1240px) 24vw, (min-width: 1000px) 32vw, (min-width: 640px) 46vw, 92vw"
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

      </div>

      {/* ----------------------------------------------- окно материала */}
      <CallbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        text={open?.lead ?? ''}
        size="lg"
        {...(open?.image ? { media: [open.image, ...(open.gallery ?? [])] } : {})}
        foot={
          open?.signup || open?.phones?.length ? (
            <>
              {open.phones?.length ? (
                <span className={s.callBox}>
                  <span className={s.callLabel}>Запись по телефону</span>
                  <span className={s.callList}>
                    {open.phones.map((num) => (
                      <a
                        className={s.call}
                        key={num}
                        href={`tel:${num.replace(/[^+\d]/g, '')}`}
                      >
                        {num}
                      </a>
                    ))}
                  </span>
                </span>
              ) : null}

              {open.signup ? (
                <a
                  className={s.signup}
                  href={open.signup}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {open.action}
                </a>
              ) : null}
            </>
          ) : undefined
        }
      >
        <InfoBody
          {...(open?.text ? { text: open.text } : {})}
          {...(open?.points ? { points: open.points } : {})}
          {...(open?.facts ? { facts: open.facts } : {})}
        />
      </CallbackModal>
    </section>
  );
}
