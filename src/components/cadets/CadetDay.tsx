'use client';

import { cadetDay } from '@/content/cadets';
import { useScrollProgressVar } from '@/lib/motion';
import s from './cadet-day.module.css';

/**
 * Распорядок дня — таблица на панели, которая раскрывается по прокрутке.
 *
 * Панель лежит от зрителя, наклонённая назад, и по мере подхода к экрану
 * распрямляется — как поднимают крышку. Заголовок в это время уходит
 * вверх, освобождая ей место. Движение связано с прокруткой и считается
 * одним числом, которое пишется в CSS-переменную: анимируются только
 * transform, вёрстка не пересчитывается.
 *
 * При выключенной анимации панель сразу стоит прямо.
 */
export function CadetDay() {
  const ref = useScrollProgressVar<HTMLElement>('--p');

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
              {/* Таблица шире телефона: сворачивается в прокрутку вбок,
                  колонка времени остаётся на месте. */}
              <div className={s.sheet}>
                <table className={s.table}>
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
                    {cadetDay.rows.map((row) => (
                      <tr key={row.time}>
                        <th className={s.time} scope="row">
                          {row.time}
                        </th>
                        {row.all === undefined ? (
                          row.cells?.map((cell, i) => (
                            <td className={s.cell} key={cadetDay.days[i] ?? String(i)}>
                              {cell}
                            </td>
                          ))
                        ) : (
                          <td className={[s.cell, s.cellAll].join(' ')} colSpan={cadetDay.days.length}>
                            {row.all}
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
