'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { profiles, profilesHref, profilesLead } from '@/content/profiles';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import { Icon } from '../ui/Icon';
import s from './profile-lane.module.css';

/** Насколько далеко уезжает снимок внутри карточки, px. */
const PAN = 26;
/** Сдвиг мышью больше этого считается перетаскиванием, а не щелчком. */
const DRAG_SLOP = 6;

/**
 * Профили 10 - 11 классов — лента с перетаскиванием.
 *
 * Лента сделана обычной прокручиваемой полосой, поэтому работает
 * без скрипта: пальцем, колесом с Shift, клавиатурой и полосой прокрутки.
 * Скрипт добавляет к этому перетаскивание мышью с инерцией, кнопки шага,
 * указатель заполнения и панораму снимков.
 *
 * Снимок внутри карточки едет в обратную сторону от самой карточки:
 * получается глубина, привязанная к положению ленты и к прокрутке
 * страницы. Двигается только фоновый слой, текст стоит на месте.
 */
export function ProfileLane() {
  const laneRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  /* Панорама снимков и указатель заполнения. */
  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;

    const reduced = prefersReducedMotion();
    let frame = 0;

    const paint = () => {
      frame = 0;

      const max = lane.scrollWidth - lane.clientWidth;
      const bar = barRef.current;
      if (bar) {
        const p = max > 0 ? lane.scrollLeft / max : 1;
        bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p)).toFixed(4)})`;
      }

      if (reduced) return;

      const mid = window.innerWidth / 2;
      for (const card of Array.from(lane.children)) {
        const el = card as HTMLElement;
        const r = el.getBoundingClientRect();
        /* -1 — карточка слева от середины окна, 1 — справа */
        const off = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / mid));
        el.style.setProperty('--pan', `${(-off * PAN).toFixed(1)}px`);
        el.style.setProperty('--near', (1 - Math.abs(off)).toFixed(3));
      }
    };

    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    paint();
    lane.addEventListener('scroll', request, { passive: true });
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);

    return () => {
      lane.removeEventListener('scroll', request);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Перетаскивание мышью с инерцией. */
  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;

    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let glide = 0;

    const stopGlide = () => {
      if (glide) window.cancelAnimationFrame(glide);
      glide = 0;
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide();
      dragging = true;
      startX = lastX = e.clientX;
      startLeft = lane.scrollLeft;
      lastT = performance.now();
      vel = 0;
      lane.dataset['drag'] = 'ready';
    };

    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_SLOP) {
        lane.dataset['drag'] = 'active';
        lane.setPointerCapture(e.pointerId);
      }
      lane.scrollLeft = startLeft - dx;

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) vel = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
    };

    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const moved = Math.abs(e.clientX - startX) > DRAG_SLOP;
      if (lane.hasPointerCapture(e.pointerId)) lane.releasePointerCapture(e.pointerId);
      /* Пометку снимаем следующим кадром: щелчок по ссылке приходит
         раньше и должен увидеть, что это было перетаскивание. */
      window.requestAnimationFrame(() => {
        delete lane.dataset['drag'];
      });

      if (!moved || prefersReducedMotion()) return;

      let v = vel * 16;
      const slide = () => {
        v *= 0.94;
        lane.scrollLeft -= v;
        glide = Math.abs(v) > 0.4 ? window.requestAnimationFrame(slide) : 0;
      };
      slide();
    };

    lane.addEventListener('pointerdown', down);
    lane.addEventListener('pointermove', move);
    lane.addEventListener('pointerup', up);
    lane.addEventListener('pointercancel', up);

    return () => {
      stopGlide();
      lane.removeEventListener('pointerdown', down);
      lane.removeEventListener('pointermove', move);
      lane.removeEventListener('pointerup', up);
      lane.removeEventListener('pointercancel', up);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const lane = laneRef.current;
    if (!lane) return;
    const first = lane.firstElementChild as HTMLElement | null;
    const by = first ? first.offsetWidth + 18 : lane.clientWidth * 0.8;
    lane.scrollBy({ left: dir * by, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section className={s.section} aria-labelledby="profiles-title">
      <div className={s.inner}>
        <div className={s.head}>
          <div>
            <h2 id="profiles-title" className={s.title}>
              Профильные 10 - 11 классы
            </h2>
            <p className={s.lead}>{profilesLead}</p>
          </div>

          <div className={s.steps}>
            <button
              type="button"
              className={s.step}
              onClick={() => step(-1)}
              aria-label="Предыдущий профиль"
            >
              <Icon name="chevron-down" size={18} className={s.stepBack} />
            </button>
            <button
              type="button"
              className={s.step}
              onClick={() => step(1)}
              aria-label="Следующий профиль"
            >
              <Icon name="chevron-down" size={18} className={s.stepNext} />
            </button>
          </div>
        </div>
      </div>

      <ul className={s.lane} ref={laneRef}>
        {profiles.map((p, i) => (
          <li
            className={s.card}
            key={p.name}
            style={{ '--i': i } as React.CSSProperties}
          >
            <Link
              className={s.link}
              href={profilesHref}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onClick={(e) => {
                /* после перетаскивания щелчок не должен уводить со страницы */
                if (laneRef.current?.dataset['drag'] === 'active') e.preventDefault();
              }}
            >
              <span className={s.media}>
                <Image
                  className={s.photo}
                  draggable={false}
                  src={asset(p.image.src)}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  sizes="(min-width: 1024px) 420px, 82vw"
                />
                <span className={s.veil} aria-hidden="true" />
                <span className={s.name}>{p.name}</span>
              </span>

              <span className={s.body}>
                <span className={s.row}>
                  <span className={s.rowLabel}>Углублённое изучение</span>
                  <span className={s.rowText}>{p.subjects}</span>
                </span>
                <span className={s.row}>
                  <span className={s.rowLabel}>Профессия в колледже</span>
                  <span className={s.rowText}>{p.college}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={s.inner}>
        <span className={s.track} aria-hidden="true">
          <span className={s.bar} ref={barRef} />
        </span>
      </div>
    </section>
  );
}
