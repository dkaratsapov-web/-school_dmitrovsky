'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { InfoBody } from '../ui/InfoBody';
import { stages } from '@/content/stages';
import type { Stage } from '@/content/stages';
import { prefersReducedMotion } from '@/lib/motion';
import s from './stage-grid.module.css';

/**
 * Откуда въезжает каждая плитка: направление связано с её местом в сетке,
 * поэтому блок «собирается», а не одинаково всплывает снизу.
 */
const ENTRY: readonly { x: number; y: number; scale: number }[] = [
  { x: -30, y: 0, scale: 0.97 },
  { x: 0, y: 26, scale: 0.97 },
  { x: 30, y: 0, scale: 0.97 },
  { x: -22, y: 18, scale: 0.97 },
  { x: 0, y: 30, scale: 0.98 },
];

/* Скрипт есть — значит можно прятать плитки до появления в окне.
   Без скрипта состояние по умолчанию видимое, ничего не пропадает. */
const subscribeNoop = () => () => {};

function OrbitBack() {
  return (
    <svg className={s.orbits} viewBox="0 0 200 200" aria-hidden="true">
      <ellipse cx="100" cy="100" rx="88" ry="34" />
      <ellipse cx="100" cy="100" rx="88" ry="34" transform="rotate(60 100 100)" />
      <ellipse cx="100" cy="100" rx="88" ry="34" transform="rotate(120 100 100)" />
      <circle className={s.nucleus} cx="100" cy="100" r="7" />
    </svg>
  );
}

/**
 * Ступени обучения — узел навигации главной страницы.
 *
 * Плитки разного размера: профильные 10 - 11 классы занимают двойную
 * ширину, остальные обычную. Каждая ведёт на свою страницу.
 *
 * Движение:
 * - плитки въезжают со стороны, где стоят в сетке, по очереди;
 * - под курсором плитка наклоняется к нему, и за ним идёт мягкий свет;
 * - орбиты атома на фоне разгоняются при наведении;
 * - подробности программы поднимаются снизу, название уходит вверх.
 * Там, где наведения нет (телефон, планшет), подробности показаны сразу.
 */
export function StageGrid() {
  const gridRef = useRef<HTMLUListElement>(null);
  /* Главная работает как лендинг: ступень раскрывается окном, а не уводит
     на отдельную страницу. */
  const [open, setOpen] = useState<Stage | null>(null);
  const hasJs = useSyncExternalStore(subscribeNoop, () => true, () => false);

  /* Появление по мере прокрутки. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-card]'));
    const showAll = () => cards.forEach((c) => c.setAttribute('data-in', 'true'));

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      showAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', 'true');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    cards.forEach((c) => io.observe(c));

    /* Страховка: если наблюдатель почему-то не сработал, плитки
       всё равно покажутся — контент не остаётся в невидимом состоянии. */
    const safety = window.setTimeout(showAll, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  /* Наклон к курсору и свет за ним. */
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--tilt-x', `${((0.5 - py) * 5).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${((px - 0.5) * 6).toFixed(2)}deg`);
  };

  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <section className={s.section} id="stages" aria-labelledby="stages-title">
      <div className={s.inner}>
        <h2 id="stages-title" className={s.title}>
          Ступени обучения
        </h2>

        <ul className={s.grid} ref={gridRef} data-js={hasJs ? 'true' : undefined}>
          {stages.map((stage, i) => {
            const from = ENTRY[i] ?? ENTRY[ENTRY.length - 1]!;
            return (
              <li
                key={stage.href}
                data-card=""
                className={[s.card, stage.wide ? s.cardWide : ''].filter(Boolean).join(' ')}
                style={
                  {
                    '--from-x': `${from.x}px`,
                    '--from-y': `${from.y}px`,
                    '--from-s': from.scale,
                    '--delay': `${i * 90}ms`,
                  } as React.CSSProperties
                }
                onPointerMove={onMove}
                onPointerLeave={onLeave}
              >
                <button className={s.link} type="button" onClick={() => setOpen(stage)}>
                  <span className={s.glow} aria-hidden="true" />
                  <OrbitBack />

                  <span className={s.mark} aria-hidden="true">
                    {stage.mark}
                  </span>

                  <span className={s.face}>
                    <span className={s.name}>{stage.title}</span>
                    <span className={s.lead}>{stage.lead}</span>
                  </span>

                  <span className={s.back}>
                    <span className={s.points}>
                      {stage.points.map((p, pi) => (
                        <span
                          className={s.point}
                          key={p}
                          style={{ '--i': pi } as React.CSSProperties}
                        >
                          {p}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <CallbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        text={open?.lead ?? ''}
        wide
      >
        <InfoBody {...(open?.points ? { points: open.points } : {})} />
      </CallbackModal>
    </section>
  );
}
