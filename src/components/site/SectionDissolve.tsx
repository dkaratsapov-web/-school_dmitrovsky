'use client';

import { useScrollProgressVar } from '@/lib/motion';
import s from './section-dissolve.module.css';

/**
 * Стык двух блоков растворением — как кадр уходит в кадр на монтаже.
 *
 * Тёмная полоса не обрывается срезом: сначала она сплошная, потом
 * распадается на строки развёртки, потом на зерно, и от неё остаётся
 * светлый фон следующего блока. Приём взят из монтажа плёнки, поэтому
 * на странице медиакласса он к месту, а купол (SectionSeam) остаётся
 * для остальных страниц — два разных стыка не путаются.
 *
 * Цвета задаются переменными --from (что сверху) и --to (что снизу).
 * Слои декоративные, текста в них нет, поэтому им можно ехать
 * от прокрутки с разной скоростью. Без скрипта и при выключенной
 * анимации стык выглядит так же, просто не движется.
 */
export function SectionDissolve({ style }: { style?: React.CSSProperties }) {
  const ref = useScrollProgressVar<HTMLDivElement>('--sp');

  return (
    <div className={s.dissolve} ref={ref} style={style} aria-hidden="true">
      <span className={s.fill} />
      <span className={s.grain} />
      <span className={s.flecks} />
    </div>
  );
}
