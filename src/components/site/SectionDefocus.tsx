'use client';

import { useScrollProgressVar } from '@/lib/motion';
import s from './section-defocus.module.css';

/**
 * Стык двух блоков расфокусом.
 *
 * Тёмная полоса не обрывается срезом: её нижний край уходит из фокуса —
 * размытая дуга растворяется в светлом фоне следующего блока, а поперёк
 * стыка медленно всплывают размытые блики, как несведённые огни в кадре.
 * Приём объективный, поэтому на странице медиакласса он к месту; купол
 * (SectionSeam) остаётся для остальных страниц.
 *
 * Цвета задаются переменными --from (что сверху) и --to (что снизу).
 * Слои декоративные, текста в них нет. Без скрипта и при выключенной
 * анимации стык выглядит так же, просто не движется.
 */

/** Блики: доля ширины, доля высоты, размер в rem и фаза всплытия. */
const LIGHTS: readonly [number, number, number, number][] = [
  [14, 62, 4.5, 0],
  [37, 38, 2.8, -6],
  [58, 70, 5.6, -12],
  [78, 44, 3.4, -3],
  [91, 66, 2.4, -9],
];

export function SectionDefocus({ style }: { style?: React.CSSProperties }) {
  const ref = useScrollProgressVar<HTMLDivElement>('--sp');

  return (
    <div className={s.seam} ref={ref} style={style} aria-hidden="true">
      <span className={s.wave} />

      <span className={s.lights}>
        {LIGHTS.map(([x, y, size, delay], i) => (
          <span
            className={s.light}
            key={i}
            style={
              {
                '--x': `${x}%`,
                '--y': `${y}%`,
                '--size': `${size}rem`,
                '--d': `${delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    </div>
  );
}
