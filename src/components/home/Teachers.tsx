'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { InfoBody } from '../ui/InfoBody';
import { teachers, teachersLead } from '@/content/teachers';
import type { Teacher } from '@/content/teachers';
import { asset } from '@/lib/asset';
import { prefersReducedMotion } from '@/lib/motion';
import s from './teachers.module.css';

/**
 * Педагоги — список коллектива, а не сетка карточек.
 *
 * Двадцать один человек: сеткой плиток это ещё одна стена вслед за кружками,
 * и разглядеть в ней кого-то конкретного нельзя. Поэтому блок собран как
 * список коллектива: строка на человека, имя крупно, должность справа.
 *
 * На широком экране рядом со списком висит портрет того, на кого наведён
 * курсор или переведён фокус, — так список остаётся списком, а лица видно.
 * Портрет декоративный: всё то же самое открывается в окне по нажатию.
 *
 * Движение отвечает на действие: под наведённой строкой прочерчивается
 * линия, портрет меняется перекрёстным проявлением. Появление строк при
 * прокрутке — одно общее движение на весь блок, линиями, а не всплытием.
 */
export function Teachers() {
  const listRef = useRef<HTMLUListElement>(null);
  const [here, setHere] = useState(0);
  const [open, setOpen] = useState<Teacher | null>(null);

  /* Появление строк по мере прокрутки. Без скрипта строки видны сразу. */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-row]'));
    const showAll = () => rows.forEach((r) => r.setAttribute('data-in', 'true'));

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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.2 },
    );
    rows.forEach((r) => io.observe(r));

    /* страховка: наблюдатель не сработал — строки всё равно показываются */
    const safety = window.setTimeout(showAll, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  const shown = teachers[here] ?? teachers[0];

  return (
    <section className={s.section} id="teachers" aria-labelledby="teachers-title">
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="teachers-title" className={s.title}>
            Педагоги
          </h2>
          <p className={s.lead}>{teachersLead}</p>
        </div>

        <div className={s.body}>
          <ul className={s.list} ref={listRef}>
            {teachers.map((t, i) => (
              <li className={s.row} key={t.name} data-row="" style={{ '--i': i % 8 } as React.CSSProperties}>
                <button
                  className={s.entry}
                  type="button"
                  onMouseEnter={() => setHere(i)}
                  onFocus={() => setHere(i)}
                  onClick={() => setOpen(t)}
                >
                  <Image
                    className={s.thumb}
                    src={asset(t.photo.src)}
                    alt=""
                    width={t.photo.width}
                    height={t.photo.height}
                    sizes="64px"
                  />
                  <span className={s.name}>{t.name}</span>
                  <span className={s.role}>{t.role}</span>
                  <span className={s.rule} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          {/* портрет рядом со списком: повторяет строку под курсором */}
          <div className={s.preview} aria-hidden="true">
            <div className={s.frame}>
              {teachers.map((t, i) => (
                <Image
                  className={s.portrait}
                  key={t.name}
                  src={asset(t.photo.src)}
                  alt=""
                  width={t.photo.width}
                  height={t.photo.height}
                  sizes="(min-width: 1100px) 360px, 0px"
                  data-on={i === here ? 'true' : undefined}
                />
              ))}
            </div>
            <p className={s.previewName}>{shown?.name}</p>
            <p className={s.previewRole}>{shown?.role}</p>

            {shown?.notes?.map((n) => (
              <p className={s.previewNote} key={n}>
                {n}
              </p>
            ))}

            {shown?.achievements?.length ? (
              <ul className={s.previewList}>
                {shown.achievements.map((a) => (
                  <li className={s.previewPoint} key={a}>
                    {a}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <CallbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.name ?? ''}
        text={open?.role ?? ''}
        size="lg"
        {...(open ? { media: open.photo } : {})}
      >
        <InfoBody
          {...(open?.notes ? { text: open.notes } : {})}
          {...(open?.achievements ? { points: open.achievements } : {})}
        />
      </CallbackModal>
    </section>
  );
}
