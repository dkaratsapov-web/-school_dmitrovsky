'use client';

import { useEffect, useRef, useState } from 'react';
import { cadetDay } from '@/content/cadets';
import { useScrollProgressVar } from '@/lib/motion';
import s from './cadet-day.module.css';

/* Школа в Москве: и «сейчас», и «сегодня» считаются по её времени,
   а не по времени того, кто смотрит страницу. */
const TZ = 'Europe/Moscow';

/** Минуты от полуночи и день недели (1 — понедельник) по времени школы. */
function readNow(): { minutes: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    weekday: order.indexOf(get('weekday')) + 1,
  };
}

/** «08:30–15:10» → [510, 910]; «14:10» → [850, null]. */
function span(time: string): [number, number | null] {
  const [from, to] = time.split('–');
  const mins = (t?: string) => {
    if (t === undefined) return null;
    const [h, m] = t.trim().split(':');
    return Number(h) * 60 + Number(m);
  };
  return [mins(from) ?? 0, mins(to)];
}

/* Строки идут по возрастанию начала, поэтому конец строки без явного
   конца — это начало следующей. */
const BOUNDS = cadetDay.rows.map((row, i) => {
  const [from, to] = span(row.time);
  const next = cadetDay.rows[i + 1];
  const fallback = next ? span(next.time)[0] : from + 30;
  return { from, to: to ?? fallback };
});

/** Какая строка идёт прямо сейчас: последняя из начавшихся и не кончившихся. */
function rowNow(minutes: number): number {
  let found = -1;
  BOUNDS.forEach((b, i) => {
    if (minutes >= b.from && minutes < b.to) found = i;
  });
  return found;
}

/**
 * Распорядок дня — таблица на панели, которая раскрывается по прокрутке.
 *
 * Панель лежит от зрителя, наклонённая назад, и по мере подхода к экрану
 * распрямляется — как поднимают крышку. Заголовок в это время уходит
 * вверх, освобождая ей место. Движение связано с прокруткой и считается
 * одним числом, которое пишется в CSS-переменную: анимируются только
 * transform, вёрстка не пересчитывается.
 *
 * Таблица живая: по времени школы подсвечивается строка, которая идёт
 * сейчас, и колонка сегодняшнего дня, а над таблицей стоит строка
 * состояния. Под курсором колонка дня подсвечивается целиком —
 * в пятнадцати колонках глазу иначе трудно держать вертикаль.
 *
 * При выключенной анимации панель сразу стоит прямо.
 */
export function CadetDay() {
  const ref = useScrollProgressVar<HTMLElement>('--p');
  const tableRef = useRef<HTMLTableElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  /* Время считается только в браузере: на сервере его нет, и разметка
     не должна от него зависеть. */
  const [now, setNow] = useState<{ minutes: number; weekday: number } | null>(null);

  useEffect(() => {
    const tick = () => setNow(readNow());
    const id = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 30000);
    return () => {
      window.clearTimeout(id);
      window.clearInterval(timer);
    };
  }, []);

  const weekday = now?.weekday ?? 0;
  const today = weekday >= 1 && weekday <= cadetDay.days.length ? weekday : 0;
  const live = today > 0 && now ? rowNow(now.minutes) : -1;

  /* Сегодняшняя колонка подводится к глазам, если таблица не помещается. */
  useEffect(() => {
    const sheet = sheetRef.current;
    const table = tableRef.current;
    if (!sheet || !table || today === 0) return;
    const head = table.querySelectorAll<HTMLElement>('thead th')[today];
    if (!head || sheet.scrollWidth <= sheet.clientWidth) return;
    sheet.scrollLeft = Math.max(0, head.offsetLeft - sheet.clientWidth / 2 + head.offsetWidth / 2);
  }, [today]);

  /* Колонка под курсором: пишем прямо в DOM, чтобы не перерисовывать
     таблицу на каждое движение мыши. */
  const mark = (el: EventTarget | null) => {
    const table = tableRef.current;
    if (!table) return;
    const cell = el instanceof Element ? el.closest('td') : null;
    if (cell && cell.colSpan === 1) table.dataset.col = String(cell.cellIndex);
    else delete table.dataset.col;
  };

  const status = (() => {
    if (!now) return null;
    if (today === 0) return 'Сегодня выходной';
    if (live >= 0) {
      const row = cadetDay.rows[live];
      const text = row?.all ?? row?.cells?.[today - 1] ?? '';
      return `Сейчас в корпусе — ${text.toLocaleLowerCase('ru')}`;
    }
    const first = BOUNDS[0];
    const last = BOUNDS[BOUNDS.length - 1];
    if (first && now.minutes < first.from) return `Занятия начнутся в ${cadetDay.rows[0]?.time}`;
    if (last && now.minutes >= last.to) return 'Занятия на сегодня закончились';
    return 'Перерыв между занятиями';
  })();

  return (
    <section className={s.section} ref={ref} aria-labelledby="cadet-day-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 className={s.title} id="cadet-day-title">
            {cadetDay.title}
          </h2>
          <p className={s.lead}>{cadetDay.note}</p>
        </div>

        <div className={s.stage}>
          <div className={s.panel}>
            <div className={s.screen}>
              {/* строка состояния появляется только в браузере: на сервере
                  времени нет, и место под неё не резервируется скачком */}
              <p className={s.status} aria-live="polite">
                {status === null ? '' : <span className={s.statusText}>{status}</span>}
              </p>

              {/* Таблица шире телефона: сворачивается в прокрутку вбок,
                  колонка времени остаётся на месте. */}
              <div className={s.sheet} ref={sheetRef}>
                <table
                  className={s.table}
                  ref={tableRef}
                  data-today={today > 0 ? String(today) : undefined}
                  onPointerOver={(e) => mark(e.target)}
                  onPointerLeave={() => mark(null)}
                >
                  <caption className="visually-hidden">
                    {cadetDay.title} {cadetDay.note}
                  </caption>
                  <thead>
                    <tr>
                      <th className={s.corner} scope="col">
                        Время
                      </th>
                      {cadetDay.days.map((d) => (
                        <th className={s.day} scope="col" key={d}>
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cadetDay.rows.map((row, r) => (
                      <tr className={r === live ? s.rowNow : undefined} key={row.time}>
                        <th className={s.time} scope="row">
                          {row.time}
                          {r === live ? <span className={s.badge}>сейчас</span> : null}
                        </th>
                        {row.all === undefined ? (
                          row.cells?.map((cell, i) => (
                            <td className={s.cell} key={cadetDay.days[i] ?? String(i)}>
                              {cell}
                            </td>
                          ))
                        ) : (
                          <td className={[s.cell, s.cellAll].join(' ')} colSpan={cadetDay.days.length}>
                            {/* на телефоне подпись держится у колонки времени,
                                пока таблица едет вбок */}
                            <span className={s.allText}>{row.all}</span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className={s.facts}>
                {cadetDay.facts.map((f) => (
                  <div className={s.fact} key={f.label}>
                    <dt className={s.factValue}>{f.value}</dt>
                    <dd className={s.factLabel}>{f.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
