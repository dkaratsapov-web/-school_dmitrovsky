'use client';

import { useEffect, useRef } from 'react';
import { Count } from '../ui/Count';
import { ButtonLink } from '../ui/Button';
import { cadetAdmission } from '@/content/cadets';
import { prefersReducedMotion, useScrollProgressVar } from '@/lib/motion';
import s from './cadet-admission.module.css';

/**
 * Приём в корпус — этапы приёмной комиссии.
 *
 * Левая колонка стоит на месте, пока справа проходят этапы: правила
 * приёма нужны глазу всё время, пока человек читает, что его ждёт.
 * Вдоль этапов чертится строевая линия — тот же приём, что в блоке
 * корпуса на главной, и здесь он по делу: это порядок действий,
 * а не набор плиток.
 *
 * Этапы проявляются по мере подхода и остаются видимыми без скрипта.
 */
export function CadetAdmission() {
  const sectionRef = useScrollProgressVar<HTMLElement>('--p');
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
    const showAll = () => items.forEach((el) => el.setAttribute('data-in', 'true'));

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      showAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', 'true');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.2 },
    );
    items.forEach((el) => io.observe(el));

    /* страховка: наблюдатель не сработал — этапы всё равно видны */
    const safety = window.setTimeout(showAll, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section className={s.section} ref={sectionRef} aria-labelledby="cadet-admission-title">
      <div className={s.inner}>
        <div className={s.side}>
          <h2 className={s.title} id="cadet-admission-title">
            {cadetAdmission.title}
          </h2>
          <p className={s.lead}>{cadetAdmission.lead}</p>

          <h3 className={s.rulesTitle}>{cadetAdmission.rulesTitle}</h3>
          <p className={s.rules}>{cadetAdmission.rules}</p>

          <p className={s.stage}>
            <span className={s.stageValue}>
              <Count to={cadetAdmission.steps.length} />
            </span>
            <span className={s.stageWord}>этапов приёмной комиссии</span>
          </p>

          <p className={s.docs}>
            <ButtonLink href={cadetAdmission.documents.href} external variant="primary">
              {cadetAdmission.documents.label}
            </ButtonLink>
            <span className={s.docsNote}>{cadetAdmission.documents.note}</span>
          </p>
        </div>

        <div className={s.main}>
          <p className={s.stepsLead}>{cadetAdmission.stepsLead}</p>

          <ol className={s.steps} ref={listRef}>
            {/* строевая линия вдоль этапов: чертится по мере прокрутки */}
            <span className={s.rail} aria-hidden="true">
              <span className={s.railFill} />
            </span>

            {cadetAdmission.steps.map((step, i) => (
              <li className={s.step} key={step} data-step="" style={{ '--d': i } as React.CSSProperties}>
                <span className={s.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={s.stepText}>{step}</span>
              </li>
            ))}
          </ol>

          <p className={s.after}>{cadetAdmission.after}</p>
        </div>
      </div>
    </section>
  );
}
