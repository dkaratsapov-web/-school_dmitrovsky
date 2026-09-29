'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Переход между страницами: новая страница открывается сверху.
 *
 * Плавной прокрутки у всей страницы нет намеренно. С ней переход по меню
 * выглядел так: сначала браузер пролистывал текущую страницу к началу,
 * потом приходила новая и её тоже пролистывало, а если страницы разной
 * высоты — прокрутка могла остановиться не на начале. Теперь переход
 * мгновенный: прокрутка сбрасывается, а плавным остаётся появление
 * первого блока.
 *
 * Плавность оставлена там, где она по делу, — у ссылок с якорем внутри
 * той же страницы: «Кружки» и «Мероприятия» в меню ведут к своим
 * разделам главной, и туда страница едет, а не прыгает.
 */
export function ScrollTop() {
  const pathname = usePathname();
  const first = useRef(true);

  /* Ссылка с якорем на эту же страницу: ведём к разделу плавно. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target !== '' && link.target !== '_self') return;
      if (link.origin !== window.location.origin) return;
      if (link.hash === '' || link.pathname !== window.location.pathname) return;

      const target = document.querySelector(link.hash);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
      window.history.pushState(null, '', link.hash);
    };

    /* перехват до маршрутизатора: иначе он уведёт по якорю прыжком,
       не дожидаясь нашего плавного хода */
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  /* Новая страница: прокрутка на верх сразу, без перелёта. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash !== '') return;

    window.scrollTo(0, 0);

    const main = document.getElementById('main');
    if (!main || prefersReducedMotion()) return;
    main.classList.remove('page-in');
    /* перезапуск анимации: без чтения свойства класс вернётся в тот же кадр */
    void main.offsetWidth;
    main.classList.add('page-in');
    const done = () => main.classList.remove('page-in');
    main.addEventListener('animationend', done, { once: true });
    return () => main.removeEventListener('animationend', done);
  }, [pathname]);

  return null;
}
