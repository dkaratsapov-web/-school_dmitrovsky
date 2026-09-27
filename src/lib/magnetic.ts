'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './motion';

/**
 * Кнопка тянется к курсору.
 *
 * Работает только там, где есть настоящий курсор: на сенсорном экране
 * тянуться не к чему, и обработчик не вешается вовсе. Смещение пишется
 * в CSS-переменные --mx и --my, само движение остаётся за стилями —
 * анимируется только transform.
 *
 * @param pull доля расстояния до курсора, на которую сдвигается кнопка
 * @param reach насколько далеко от кнопки она начинает реагировать, px
 */
export function useMagnetic<T extends HTMLElement>(pull = 0.28, reach = 90) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty('--mx', `${x.toFixed(1)}px`);
      el.style.setProperty('--my', `${y.toFixed(1)}px`);
    };
    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      /* за пределами досягаемости кнопка стоит на месте */
      const near = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach;
      x = near ? dx * pull : 0;
      y = near ? dy * pull * 0.6 : 0;
      request();
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      request();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pull, reach]);

  return ref;
}
