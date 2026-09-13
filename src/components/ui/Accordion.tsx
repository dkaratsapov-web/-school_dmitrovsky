'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import s from './ui.module.css';

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

type Props = {
  items: readonly FaqItem[];
  /** Разрешить открытыми несколько вопросов одновременно. */
  multiple?: boolean;
};

/** FAQ-аккордеон: доступен с клавиатуры, состояние объявляется aria-expanded. */
export function Accordion({ items, multiple = true }: Props) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());

  const toggle = (index: number) => {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className={s.accordion}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.question} className={s.accItem}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={btnId}
                className={s.accBtn}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
              >
                <span>{item.question}</span>
                <Icon name="chevron-down" size={22} className={s.accIcon} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
              <div className={s.accPanel}>{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
