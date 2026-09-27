'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Число, которое набегает, когда до него дошли.
 *
 * В разметку сразу выводится конечное значение: без скрипта и при
 * выключенной анимации человек видит правильную цифру, а не ноль.
 * Считается только то, что уже посчитано в контенте, — компонент
 * ничего не складывает и не округляет сам (ТЗ §7).
 */
export function Count({ to, duration = 900 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        /* к концу замедляется: цифра «доезжает», а не обрывается */
        const eased = 1 - (1 - t) ** 3;
        el.textContent = String(Math.round(to * eased));
        if (t < 1) frame = window.requestAnimationFrame(step);
      };
      frame = window.requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return <span ref={ref}>{to}</span>;
}
