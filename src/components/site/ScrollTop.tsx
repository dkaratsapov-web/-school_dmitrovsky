'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Переход между страницами: уходим с верха и приходим на верх.
 *
 * Раньше человек, нажавший логотип из середины страницы, ещё секунду
 * смотрел на прежнюю страницу, а потом оказывался неизвестно где:
 * адрес менялся до того, как приходила новая страница.
 *
 * Теперь по нажатию текущая страница сама уезжает к началу — движение
 * начинается сразу, в ответ на нажатие. Когда новая страница встаёт
 * на место, прокрутка уже сброшена, и её первый блок проявляется
 * коротким подъёмом.
 *
 * Адреса с якорем не трогаем: «Педагоги» и «Кружки» в меню ведут
 * к своим разделам главной — прокрутка к ним их работа.
 */
export function ScrollTop() {
  const pathname = usePathname();
  const first = useRef(true);

  /* Нажатие на ссылку: страница уезжает вверх, не дожидаясь перехода. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target !== '' && link.target !== '_self') return;
      if (link.origin !== window.location.origin) return;
      if (link.hash !== '') return;
      if (link.pathname === window.location.pathname) return;
      if (window.scrollY === 0) return;

      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  /* Новая страница: прокрутка на верх без анимации — плавным остаётся
     появление первого блока, а не перелёт через всю прежнюю страницу. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash !== '') return;

    const root = document.documentElement;
    const keep = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = keep;

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
