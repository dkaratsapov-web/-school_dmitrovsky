'use client';

import { useState } from 'react';
import { clubGroups } from '@/content/clubs';
import { asset } from '@/lib/asset';
import type { Field } from '@/content/admin-schema';
import s from './admin.module.css';

/** Материал в редакторе: набор полей произвольного вида. */
export type Item = Record<string, unknown>;

type Img = { src: string; width: number; height: number; alt: string };
type Pair = { label: string; value: string };
type Link = { label: string; href: string };

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Пустое значение убираем из материала: в файле не должно быть мусора. */
function clean(item: Item, key: string, value: unknown): Item {
  const next = { ...item };
  const empty =
    value === '' ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    value === false;
  if (empty) delete next[key];
  else next[key] = value;
  return next;
}

/* ------------------------------------------------------------- снимок */

function ImageField({
  value,
  onChange,
}: {
  value: Img | undefined;
  onChange: (v: Img | undefined) => void;
}) {
  const [sizing, setSizing] = useState(false);
  const img = value ?? { src: '', width: 0, height: 0, alt: '' };

  const set = (patch: Partial<Img>) => {
    const next = { ...img, ...patch };
    onChange(next.src === '' && next.alt === '' ? undefined : next);
  };

  /* Размеры не надо переписывать руками: читаем их у самого файла. */
  const measure = () => {
    if (!img.src) return;
    setSizing(true);
    const probe = new window.Image();
    probe.onload = () => {
      setSizing(false);
      set({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.onerror = () => setSizing(false);
    probe.src = asset(img.src);
  };

  return (
    <div className={s.image}>
      <div className={s.imageMain}>
        <label className={s.sub}>
          <span>Файл</span>
          <input
            className={s.input}
            value={img.src}
            placeholder="/images/club-sambo.webp"
            onChange={(e) => set({ src: e.target.value })}
          />
        </label>

        <label className={s.sub}>
          <span>Описание для незрячих</span>
          <input
            className={s.input}
            value={img.alt}
            placeholder="Что на снимке"
            onChange={(e) => set({ alt: e.target.value })}
          />
        </label>

        <div className={s.sizes}>
          <label className={s.sub}>
            <span>Ширина</span>
            <input
              className={s.input}
              type="number"
              value={img.width || ''}
              onChange={(e) => set({ width: Number(e.target.value) })}
            />
          </label>
          <label className={s.sub}>
            <span>Высота</span>
            <input
              className={s.input}
              type="number"
              value={img.height || ''}
              onChange={(e) => set({ height: Number(e.target.value) })}
            />
          </label>
          <button className={s.small} type="button" onClick={measure} disabled={!img.src}>
            {sizing ? 'Читаю…' : 'Определить размеры'}
          </button>
        </div>
      </div>

      {img.src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className={s.preview} src={asset(img.src)} alt="" />
      ) : (
        <div className={[s.preview, s.previewEmpty].join(' ')}>нет файла</div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- поле по виду */

export function FieldEditor({
  field,
  item,
  onChange,
}: {
  field: Field;
  item: Item;
  onChange: (next: Item) => void;
}) {
  const set = (value: unknown) => onChange(clean(item, field.key, value));
  const v = item[field.key];

  if (field.kind === 'text') {
    return (
      <label className={s.field}>
        <span className={s.label}>{field.label}</span>
        <input className={s.input} value={str(v)} onChange={(e) => set(e.target.value)} />
        {field.hint ? <span className={s.hint}>{field.hint}</span> : null}
      </label>
    );
  }

  if (field.kind === 'area') {
    return (
      <label className={s.field}>
        <span className={s.label}>{field.label}</span>
        <textarea
          className={s.area}
          rows={2}
          value={str(v)}
          onChange={(e) => set(e.target.value)}
        />
        {field.hint ? <span className={s.hint}>{field.hint}</span> : null}
      </label>
    );
  }

  if (field.kind === 'lines') {
    const lines = arr<string>(v);
    return (
      <label className={s.field}>
        <span className={s.label}>{field.label}</span>
        <textarea
          className={s.area}
          rows={Math.min(10, Math.max(3, lines.length + 1))}
          value={lines.join('\n')}
          onChange={(e) =>
            set(
              e.target.value
                .split('\n')
                .map((x) => x.trim())
                .filter(Boolean),
            )
          }
        />
        <span className={s.hint}>{field.hint ?? 'Каждая строка — отдельный пункт'}</span>
      </label>
    );
  }

  if (field.kind === 'flag') {
    return (
      <label className={s.check}>
        <input type="checkbox" checked={v === true} onChange={(e) => set(e.target.checked)} />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.kind === 'groups') {
    const picked = arr<string>(v);
    return (
      <div className={s.field}>
        <span className={s.label}>{field.label}</span>
        <div className={s.chips}>
          {clubGroups.map((g) => {
            const on = picked.includes(g);
            return (
              <button
                key={g}
                type="button"
                className={[s.chip, on ? s.chipOn : ''].filter(Boolean).join(' ')}
                onClick={() => set(on ? picked.filter((x) => x !== g) : [...picked, g])}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.kind === 'image') {
    return (
      <div className={s.field}>
        <span className={s.label}>{field.label}</span>
        <ImageField value={v as Img | undefined} onChange={(next) => set(next)} />
        {field.hint ? <span className={s.hint}>{field.hint}</span> : null}
      </div>
    );
  }

  if (field.kind === 'images') {
    const list = arr<Img>(v);
    const put = (i: number, next: Img | undefined) =>
      set(next ? list.map((x, k) => (k === i ? next : x)) : list.filter((_, k) => k !== i));
    const move = (i: number, d: number) => {
      const next = [...list];
      const to = i + d;
      if (to < 0 || to >= next.length) return;
      const a = next[i];
      const b = next[to];
      if (!a || !b) return;
      next[i] = b;
      next[to] = a;
      set(next);
    };
    return (
      <div className={s.field}>
        <span className={s.label}>{field.label}</span>
        {list.map((img, i) => (
          <div className={s.row} key={`${img.src}-${i}`}>
            <ImageField value={img} onChange={(next) => put(i, next)} />
            <div className={s.rowTools}>
              <button className={s.small} type="button" onClick={() => move(i, -1)}>
                Выше
              </button>
              <button className={s.small} type="button" onClick={() => move(i, 1)}>
                Ниже
              </button>
              <button className={s.small} type="button" onClick={() => put(i, undefined)}>
                Убрать
              </button>
            </div>
          </div>
        ))}
        <button
          className={s.small}
          type="button"
          onClick={() => set([...list, { src: '', width: 0, height: 0, alt: '' }])}
        >
          Добавить снимок
        </button>
      </div>
    );
  }

  if (field.kind === 'pairs' || field.kind === 'links') {
    const isLink = field.kind === 'links';
    const list = arr<Pair & Link>(v);
    const put = (i: number, patch: Partial<Pair & Link>) =>
      set(list.map((x, k) => (k === i ? { ...x, ...patch } : x)));
    return (
      <div className={s.field}>
        <span className={s.label}>{field.label}</span>
        {list.map((pair, i) => (
          <div className={s.pair} key={i}>
            <input
              className={s.input}
              value={pair.label ?? ''}
              placeholder={isLink ? 'Подпись ссылки' : 'Название'}
              onChange={(e) => put(i, { label: e.target.value })}
            />
            <input
              className={s.input}
              value={isLink ? (pair.href ?? '') : (pair.value ?? '')}
              placeholder={isLink ? 'https://…' : 'Значение'}
              onChange={(e) => put(i, isLink ? { href: e.target.value } : { value: e.target.value })}
            />
            <button
              className={s.small}
              type="button"
              onClick={() => set(list.filter((_, k) => k !== i))}
            >
              Убрать
            </button>
          </div>
        ))}
        <button
          className={s.small}
          type="button"
          onClick={() => set([...list, isLink ? { label: '', href: '' } : { label: '', value: '' }])}
        >
          Добавить строку
        </button>
      </div>
    );
  }

  if (field.kind === 'phone') {
    const phone = (v as { display?: string; tel?: string } | undefined) ?? {};
    const put = (patch: { display?: string; tel?: string }) => {
      const next = { display: phone.display ?? '', tel: phone.tel ?? '', ...patch };
      set(next.display === '' && next.tel === '' ? undefined : next);
    };
    return (
      <div className={s.field}>
        <span className={s.label}>{field.label}</span>
        <div className={s.pair}>
          <input
            className={s.input}
            value={phone.display ?? ''}
            placeholder="+7 (915) 412-54-50"
            onChange={(e) => put({ display: e.target.value })}
          />
          <input
            className={s.input}
            value={phone.tel ?? ''}
            placeholder="+79154125450"
            onChange={(e) => put({ tel: e.target.value })}
          />
        </div>
        <span className={s.hint}>Слева — как показывать, справа — для набора номера</span>
      </div>
    );
  }

  return null;
}
