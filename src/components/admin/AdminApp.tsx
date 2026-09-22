'use client';

import { useEffect, useState } from 'react';
import clubsData from '@/content/data/clubs.json';
import newsData from '@/content/data/news.json';
import teachersData from '@/content/data/teachers.json';
import reviewsData from '@/content/data/reviews.json';
import {
  clubSchema,
  eventSchema,
  newsSchema,
  reviewSchema,
  teacherSchema,
} from '@/content/admin-schema';
import type { Schema } from '@/content/admin-schema';
import { FieldEditor } from './fields';
import type { Item } from './fields';
import s from './admin.module.css';

/* Слепок опубликованных материалов: с ним сравниваем правки. */
type Data = {
  clubs: { groups: string[]; clubs: Item[]; events: Item[] };
  news: { items: Item[] };
  teachers: { lead: string; items: Item[] };
  reviews: { lead: string; yandexOrgId: string; yandexLink: string; videos: Item[] };
};

const PUBLISHED: Data = {
  clubs: clubsData as unknown as Data['clubs'],
  news: newsData as unknown as Data['news'],
  teachers: teachersData as unknown as Data['teachers'],
  reviews: reviewsData as unknown as Data['reviews'],
};

const STORE = 'sd-admin-draft-1';

type TabKey = 'clubs' | 'events' | 'news' | 'teachers' | 'reviews';

type Tab = {
  key: TabKey;
  schema: Schema;
  /** Из какого файла берётся список и как он там называется. */
  file: keyof Data;
  list: string;
};

const TABS: readonly Tab[] = [
  { key: 'clubs', schema: clubSchema, file: 'clubs', list: 'clubs' },
  { key: 'events', schema: eventSchema, file: 'clubs', list: 'events' },
  { key: 'news', schema: newsSchema, file: 'news', list: 'items' },
  { key: 'teachers', schema: teacherSchema, file: 'teachers', list: 'items' },
  { key: 'reviews', schema: reviewSchema, file: 'reviews', list: 'videos' },
];

const FILE_NAMES: Record<keyof Data, string> = {
  clubs: 'clubs.json',
  news: 'news.json',
  teachers: 'teachers.json',
  reviews: 'reviews.json',
};

function copy(data: Data): Data {
  return JSON.parse(JSON.stringify(data)) as Data;
}

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Админка: правка материалов сайта без залезания в код.
 *
 * Сайт статический, сервера у него нет, поэтому редактор работает
 * в браузере: правки держатся в памяти и в хранилище браузера, а наружу
 * выходят готовыми файлами — их кладут в папку src/content/data,
 * и сайт пересобирается сам.
 *
 * Черновик не теряется при закрытии вкладки: он лежит в браузере, пока
 * его не сбросили. Опубликованные материалы всегда доступны кнопкой
 * «Вернуть опубликованное».
 */
export function AdminApp() {
  const [data, setData] = useState<Data>(() => copy(PUBLISHED));
  const [tab, setTab] = useState<TabKey>('clubs');
  const [at, setAt] = useState(0);
  const [note, setNote] = useState('');

  /* Черновик из прошлого захода. Чтение отложено на кадр: состояние
     нельзя менять прямо в теле эффекта. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORE);
        if (raw) {
          setData(JSON.parse(raw) as Data);
          setNote('Открыт черновик из этого браузера');
        }
      } catch {
        /* хранилище недоступно — работаем без черновика */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* Сохраняем черновик при каждой правке. */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORE, JSON.stringify(data));
    } catch {
      /* приватный режим: черновик живёт только до перезагрузки */
    }
  }, [data]);

  const current = TABS.find((t) => t.key === tab) ?? TABS[0]!;
  const bucket = data[current.file] as unknown as Record<string, unknown>;
  const items = (bucket[current.list] as Item[] | undefined) ?? [];
  const item = items[at];

  const putList = (next: Item[]) => {
    setData((d) => {
      const copyData = copy(d);
      const target = copyData[current.file] as unknown as Record<string, unknown>;
      target[current.list] = next;
      return copyData;
    });
  };

  const putItem = (next: Item) => putList(items.map((x, i) => (i === at ? next : x)));

  const add = () => {
    putList([...items, {}]);
    setAt(items.length);
  };

  const remove = () => {
    if (!item) return;
    const title = String(item[current.schema.titleKey] ?? 'без названия');
    if (!window.confirm(`Удалить ${current.schema.one} «${title}»?`)) return;
    putList(items.filter((_, i) => i !== at));
    setAt(Math.max(0, at - 1));
  };

  const move = (d: number) => {
    const to = at + d;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const a = next[at];
    const b = next[to];
    if (!a || !b) return;
    next[at] = b;
    next[to] = a;
    putList(next);
    setAt(to);
  };

  const dirty = JSON.stringify(data) !== JSON.stringify(PUBLISHED);
  const fileText = `${JSON.stringify(data[current.file], null, 2)}\n`;

  return (
    <div className={s.app}>
      <header className={s.top}>
        <div>
          <h1 className={s.title}>Материалы сайта</h1>
          <p className={s.lead}>
            Правки видны здесь сразу. Чтобы они попали на сайт, скачайте файл раздела и положите
            его в папку <code>src/content/data</code> — сайт пересоберётся сам.
          </p>
        </div>

        <div className={s.state}>
          <span className={dirty ? s.dirty : s.clean}>
            {dirty ? 'Есть правки, не попавшие на сайт' : 'Совпадает с сайтом'}
          </span>
          {note ? <span className={s.note}>{note}</span> : null}
        </div>
      </header>

      <nav className={s.tabs} aria-label="Разделы">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={[s.tab, t.key === tab ? s.tabOn : ''].filter(Boolean).join(' ')}
            onClick={() => {
              setTab(t.key);
              setAt(0);
            }}
          >
            {t.schema.many}
          </button>
        ))}
      </nav>

      <div className={s.body}>
        <aside className={s.side}>
          <ol className={s.list}>
            {items.map((x, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={[s.entry, i === at ? s.entryOn : ''].filter(Boolean).join(' ')}
                  onClick={() => setAt(i)}
                >
                  <span className={s.entryNum}>{i + 1}</span>
                  <span className={s.entryName}>
                    {String(x[current.schema.titleKey] ?? '') || 'Без названия'}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <button className={s.add} type="button" onClick={add}>
            Добавить {current.schema.one}
          </button>
        </aside>

        <section className={s.editor}>
          {item ? (
            <>
              <div className={s.tools}>
                <button className={s.small} type="button" onClick={() => move(-1)}>
                  Выше
                </button>
                <button className={s.small} type="button" onClick={() => move(1)}>
                  Ниже
                </button>
                <button className={[s.small, s.danger].join(' ')} type="button" onClick={remove}>
                  Удалить
                </button>
              </div>

              {current.schema.fields.map((f) => (
                <FieldEditor key={f.key} field={f} item={item} onChange={putItem} />
              ))}
            </>
          ) : (
            <p className={s.empty}>
              В разделе пока пусто. Нажмите «Добавить {current.schema.one}».
            </p>
          )}
        </section>
      </div>

      <footer className={s.foot}>
        <button
          className={s.primary}
          type="button"
          onClick={() => download(FILE_NAMES[current.file], fileText)}
        >
          Скачать {FILE_NAMES[current.file]}
        </button>

        <button
          className={s.small}
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(fileText).then(
              () => setNote('Файл скопирован'),
              () => setNote('Скопировать не удалось'),
            );
          }}
        >
          Скопировать
        </button>

        <label className={s.small}>
          Загрузить файл
          <input
            className={s.file}
            type="file"
            accept="application/json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              void f.text().then((text) => {
                try {
                  const parsed = JSON.parse(text) as unknown;
                  setData((d) => ({ ...copy(d), [current.file]: parsed }) as Data);
                  setNote(`Загружен ${FILE_NAMES[current.file]}`);
                } catch {
                  setNote('Файл не разобран: это не JSON');
                }
              });
            }}
          />
        </label>

        <button
          className={s.small}
          type="button"
          onClick={() => {
            if (!window.confirm('Вернуть всё к тому, что сейчас на сайте? Правки пропадут.')) return;
            setData(copy(PUBLISHED));
            setAt(0);
            setNote('Возвращено опубликованное');
          }}
        >
          Вернуть опубликованное
        </button>
      </footer>
    </div>
  );
}
