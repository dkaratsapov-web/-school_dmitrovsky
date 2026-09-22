'use client';

import { useEffect, useState } from 'react';
import { ClubsEvents } from '../home/ClubsEvents';
import { NewsDeck } from '../home/NewsDeck';
import { Teachers } from '../home/Teachers';
import { Reviews } from '../home/Reviews';
import type { Club, EventItem } from '@/content/clubs';
import type { NewsItem } from '@/content/news';
import type { Teacher } from '@/content/teachers';
import type { VideoReview } from '@/content/reviews';

/**
 * Сцена превью: та же страница сайта, только с одним материалом.
 *
 * Живёт в отдельном окне (iframe) и получает материал сообщением
 * из админки. Окно нужно именно отдельное: телефонная вёрстка
 * включается по ширине окна, и показать её внутри широкой страницы
 * уменьшением карточки нельзя — получится не телефон, а уменьшённый
 * компьютер.
 *
 * Здесь работают настоящие блоки сайта, а не их копии: что видно
 * в превью, то и выйдет на сайт.
 */

type Payload = { type: 'sd-preview'; tab: string; item: Record<string, unknown> };

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = <T,>(v: unknown): readonly T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Снимок считается годным, когда у него есть файл и размеры. */
function shot(v: unknown): { src: string; width: number; height: number; alt: string } | null {
  if (typeof v !== 'object' || v === null) return null;
  const im = v as Record<string, unknown>;
  if (typeof im['src'] !== 'string' || im['src'] === '') return null;
  return {
    src: im['src'],
    width: typeof im['width'] === 'number' && im['width'] > 0 ? im['width'] : 1200,
    height: typeof im['height'] === 'number' && im['height'] > 0 ? im['height'] : 800,
    alt: typeof im['alt'] === 'string' ? im['alt'] : '',
  };
}

export function PreviewStage() {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as Payload | null;
      if (d && d.type === 'sd-preview') setData(d);
    };
    window.addEventListener('message', onMessage);
    /* сообщаем админке, что окно готово принимать материал */
    window.parent.postMessage({ type: 'sd-preview-ready' }, window.location.origin);

    /* и сколько места занял материал: админка подрежет окно по нему,
       иначе под карточкой остаётся пустое поле в полэкрана */
    const tell = () => {
      window.parent.postMessage(
        { type: 'sd-preview-size', height: document.body.scrollHeight },
        window.location.origin,
      );
    };
    const ro = new ResizeObserver(tell);
    ro.observe(document.body);

    return () => {
      window.removeEventListener('message', onMessage);
      ro.disconnect();
    };
  }, []);

  if (!data) return null;
  const it = data.item;

  if (data.tab === 'clubs') {
    const image = shot(it['image']);
    const club: Club = {
      title: str(it['title']) || 'Без названия',
      lead: str(it['lead']),
      groups: list<string>(it['groups']),
      ...(image ? { image } : {}),
      ...(it['draft'] === true ? { draft: true } : {}),
      ...(Array.isArray(it['text']) ? { text: list<string>(it['text']) } : {}),
      ...(Array.isArray(it['points']) ? { points: list<string>(it['points']) } : {}),
    } as Club;
    return <ClubsEvents key="clubs" bare clubsData={[club]} startTab="clubs" />;
  }

  if (data.tab === 'events') {
    const image = shot(it['image']);
    const event = {
      title: str(it['title']) || 'Без названия',
      text: str(it['text']),
      ...(str(it['when']) ? { when: str(it['when']) } : {}),
      ...(image ? { image } : {}),
    } as unknown as EventItem;
    return <ClubsEvents key="events" bare eventsData={[event]} startTab="events" />;
  }

  if (data.tab === 'news') {
    const images = list<unknown>(it['images']).map(shot).filter(Boolean) as NewsItem['images'];
    const item = {
      title: str(it['title']) || 'Без названия',
      ...(Array.isArray(it['text']) ? { text: list<string>(it['text']) } : {}),
      ...(images && images.length ? { images } : {}),
    } as NewsItem;
    return <NewsDeck bare items={[item]} />;
  }

  if (data.tab === 'teachers') {
    const photo = shot(it['photo']);
    if (!photo) return <p className="preview-note">Добавьте снимок — без него карточки нет.</p>;
    const teacher: Teacher = {
      name: str(it['name']) || 'Без имени',
      role: str(it['role']),
      photo,
      ...(Array.isArray(it['notes']) ? { notes: list<string>(it['notes']) } : {}),
      ...(Array.isArray(it['achievements'])
        ? { achievements: list<string>(it['achievements']) }
        : {}),
    };
    return <Teachers bare items={[teacher]} />;
  }

  if (data.tab === 'reviews') {
    const id = str(it['rutube']);
    if (!id) return <p className="preview-note">Укажите ролик на Rutube — без него карточки нет.</p>;
    const video: VideoReview = {
      rutube: id,
      ...(str(it['name']) ? { name: str(it['name']) } : {}),
      ...(str(it['role']) ? { role: str(it['role']) } : {}),
    };
    return <Reviews bare videos={[video]} />;
  }

  return null;
}
