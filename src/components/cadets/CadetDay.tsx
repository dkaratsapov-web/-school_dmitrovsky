'use client';

import { cadetDay } from '@/content/cadets';
import { useScrollProgressVar } from '@/lib/motion';
import s from './cadet-day.module.css';

/**
 * Распорядок дня — панель, которая раскрывается по мере прокрутки.
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
          <p className={s.lead}>{cadetDay.lead}</p>
        </div>

        <div className={s.stage}>
          <div className={s.panel}>
            <div className={s.screen}>
              <p className={s.text}>{cadetDay.text}</p>

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
