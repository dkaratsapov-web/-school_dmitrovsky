'use client';

import { useEffect, useRef } from 'react';
import { ConsultBar } from '../forms/ConsultBar';
import { engineerHeroLead, engineerHeroTitle } from '@/content/engineer';
import { prefersReducedMotion } from '@/lib/motion';
import s from './engineer-hero.module.css';

/**
 * Первый экран инженерного класса.
 *
 * Справа стоит знак школы, собранный в объёме: атом с тремя орбитами,
 * по каждой идёт спутник. Вся сборка поворачивается вслед за курсором,
 * вместе с ней смещается пятно света и чертёжная сетка позади — каждый
 * слой со своей скоростью, поэтому сцена читается объёмной.
 *
 * Положение курсора пишется в CSS-переменные одним проходом в кадре
 * отрисовки: React на движение мыши не перерисовывается, анимируются
 * только transform и opacity.
 *
 * Курсора может не быть вовсе — на телефоне сборка качается сама.
 * При выключенной анимации сцена стоит неподвижно и на курсор
 * не отзывается.
 */

/** Три орбиты: наклон по X, наклон по Y и время оборота спутника. */
const RINGS: readonly [number, number, number][] = [
  [68, 18, 14],
  [-54, 32, 19],
  [12, -70, 25],
];

export function EngineerHero() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    let mx = 0;
    let my = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty('--mx', mx.toFixed(4));
      el.style.setProperty('--my', my.toFixed(4));
    };
    const request = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      /* от −1 до 1: середина сцены — ноль */
      mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      request();
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
      request();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={s.hero} aria-labelledby="engineer-title">
      <div className={s.stage} ref={stageRef}>
        {/* чертёжная сетка позади: слой декоративный, идёт за курсором
            медленнее самой сборки */}
        <span className={s.grid} aria-hidden="true" />
        <span className={s.glow} aria-hidden="true" />

        <div className={s.inner}>
          <div className={s.copy}>
            <h1 className={s.title} id="engineer-title">
              {engineerHeroTitle}
            </h1>
            <p className={s.lead}>{engineerHeroLead}</p>
          </div>

          <div className={s.scene} aria-hidden="true">
            <div className={s.float}>
              <div className={s.rig}>
                {RINGS.map(([rx, ry, dur], i) => (
                  <span
                    className={s.ring}
                    key={i}
                    style={
                      {
                        '--rx': `${rx}deg`,
                        '--ry': `${ry}deg`,
                        '--dur': `${dur}s`,
                      } as React.CSSProperties
                    }
                  >
                    <span className={s.spin}>
                      <span className={s.line} />
                      <span className={s.sat} />
                    </span>
                  </span>
                ))}

                <span className={s.core}>
                  <svg className={s.mark} viewBox="0 0 24 24" focusable="false">
                    <ellipse cx="12" cy="12" rx="10.4" ry="4.5" transform="rotate(-28 12 12)" />
                    <ellipse cx="12" cy="12" rx="10.4" ry="4.5" transform="rotate(28 12 12)" />
                    <circle cx="12" cy="12" r="2.4" />
                  </svg>
                </span>

                <span className={s.shadow} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.bar}>
        <ConsultBar />
      </div>
    </section>
  );
}
