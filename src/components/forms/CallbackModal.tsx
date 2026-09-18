'use client';

import { useEffect, useRef } from 'react';
import { ConsultInline } from './ConsultInline';
import s from './callback-modal.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Заголовок окна: у разных кнопок он свой. */
  title?: string;
  action?: string;
};

/**
 * Окно с формой заявки.
 *
 * Сделано на теге dialog: браузер сам держит фокус внутри окна, закрывает
 * его по Esc и возвращает фокус кнопке, которая окно открыла. Это дешевле
 * и надёжнее, чем собственная ловушка фокуса.
 */
export function CallbackModal({ open, onClose, title = 'Заказать звонок', action = 'Отправить' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      className={s.dialog}
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        /* щелчок по затемнению вокруг окна закрывает его */
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={s.inner}>
        <button className={s.close} type="button" onClick={onClose} aria-label="Закрыть">
          <span className={s.closeBar} />
          <span className={s.closeBar} />
        </button>

        <p className={s.title}>{title}</p>
        <p className={s.text}>Оставьте имя и телефон — перезвоним и ответим на вопросы.</p>

        <ConsultInline title="" action={action} />
      </div>
    </dialog>
  );
}
