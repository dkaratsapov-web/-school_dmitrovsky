'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Движение без внешних библиотек.
 *
 * Значения считаются в requestAnimationFrame и пишутся в CSS-переменные,
 * поэтому анимируются только transform и opacity — пересчёта вёрстки нет.
 * При prefers-reduced-motion эффекты выключаются, а конечное состояние
 * показывается сразу (CLAUDE.md, раздел «Движение»).
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Сколько страница прокручена от верха, в пикселях. */
export function useScrollY(): number {
  const [y, setY] = useState(0);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setY(window.scrollY);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return y;
}

/**
 * Прогресс прокрутки элемента через окно: 0 — верх элемента у низа окна,
 * 1 — низ элемента у верха окна. Пишется в CSS-переменную, чтобы
 * не перерисовывать React на каждый кадр.
 */
export function useScrollProgressVar<T extends HTMLElement>(varName: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height + window.innerHeight;
      const raw = (window.innerHeight - rect.top) / span;
      const p = Math.min(1, Math.max(0, raw));
      el.style.setProperty(varName, p.toFixed(4));
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [varName]);

  return ref;
}
