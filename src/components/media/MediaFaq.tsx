'use client';

import { useId, useState } from 'react';
import { mediaFaq } from '@/content/media';
import s from './media-faq.module.css';

/**
 * Вопросы родителей — разбор не гармошкой.
 *
 * Слева список вопросов, справа окно с ответом: открыт всегда один,
 * и окно держит свою высоту, поэтому при переключении список под рукой
 * не прыгает. Ответы сменяются наплывом, у выбранного вопроса вырастает
 * бордовая рейка и краснеет номер.
 *
 * На кадетской странице вопросы раскрываются гармошкой — здесь разбор
 * другой намеренно: это разные страницы, и один и тот же приём дважды
 * читался бы шаблоном.
 *
 * Ответы лежат в разметке все сразу, скрытый убран из доступного дерева
 * через visibility — так и наплыв работает, и с экрана читается только
 * открытый ответ.
 */
export function MediaFaq() {
  const baseId = useId();
  const [open, setOpen] = useState(0);

  return (
    <section className={s.section} aria-labelledby="media-faq-title">
      <div className={s.inner}>
        <h2 className={s.title} id="media-faq-title">
          {mediaFaq.title}
        </h2>

        <div className={s.board}>
          <ul className={s.list}>
            {mediaFaq.items.map((item, i) => {
              const on = open === i;
              return (
                <li className={s.item} key={item.q} data-on={on ? 'true' : 'false'}>
                  <button
                    className={s.q}
                    type="button"
                    id={`${baseId}-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`${baseId}-a-${i}`}
                    onClick={() => setOpen(i)}
                  >
                    <span className={s.rail} aria-hidden="true" />
                    <span className={s.num} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={s.qText}>{item.q}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={s.panel}>
            {mediaFaq.items.map((item, i) => (
              <p
                className={s.a}
                key={item.q}
                id={`${baseId}-a-${i}`}
                role="region"
                aria-labelledby={`${baseId}-q-${i}`}
                data-on={open === i ? 'true' : 'false'}
              >
                {item.a}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
