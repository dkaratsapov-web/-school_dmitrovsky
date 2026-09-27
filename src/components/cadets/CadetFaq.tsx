'use client';

import { useId, useState } from 'react';
import { cadetFaq } from '@/content/cadets';
import { contacts } from '@/content/site';
import s from './cadet-faq.module.css';

/**
 * Вопросы родителей.
 *
 * Слева вопрос стоит на месте, пока справа человек раскрывает ответы:
 * открыт всегда один — так видно, что список конечный, и не приходится
 * искать, где кончился предыдущий ответ.
 *
 * Знак у вопроса — плюс, который поворачивается в крест: движение
 * отвечает нажатию и показывает, что изменилось.
 */
export function CadetFaq() {
  const baseId = useId();
  /* первый ответ открыт: видно, что список раскрывается */
  const [open, setOpen] = useState(0);
  const phone = contacts.phones[0];

  return (
    <section className={s.section} aria-labelledby="cadet-faq-title">
      <div className={s.inner}>
        <div className={s.side}>
          <h2 className={s.title} id="cadet-faq-title">
            {cadetFaq.title}
          </h2>
          <p className={s.lead}>{cadetFaq.lead}</p>

          {phone ? (
            <p className={s.call}>
              <a className={s.phone} href={`tel:${phone.tel}`}>
                {phone.display}
              </a>
              <span className={s.callNote}>{cadetFaq.callNote}</span>
            </p>
          ) : null}
        </div>

        <ul className={s.list}>
          {cadetFaq.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `${baseId}-q-${i}`;
            const panelId = `${baseId}-a-${i}`;

            return (
              <li className={s.item} key={item.q}>
                <h3 className={s.head}>
                  <button
                    className={s.q}
                    type="button"
                    id={btnId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className={s.qText}>{item.q}</span>
                    <span className={s.mark} aria-hidden="true">
                      <span className={s.bar} />
                      <span className={s.bar} />
                    </span>
                  </button>
                </h3>

                <div className={s.panel} id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
                  <p className={s.a}>{item.a}</p>

                  {item.items ? (
                    <ul className={s.sub}>
                      {item.items.map((line) => (
                        <li className={s.subItem} key={line}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
