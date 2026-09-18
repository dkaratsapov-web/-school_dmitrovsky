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
  /** Подпись под заголовком. */
  text?: string;
  /** Своя форма вместо короткой заявки на звонок. */
  children?: React.ReactNode;
  /** Окно шире: для форм с большим числом полей. */
  wide?: boolean;
};

/**
 * Окно с формой заявки.
 *
 * Сделано на теге dialog: браузер сам держит фокус внутри окна, закрывает
 * его по Esc и возвращает фокус кнопке, которая окно открыла. Это дешевле
 * и надёжнее, чем собственная ловушка фокуса.
 */
export function CallbackModal({
  open,
  onClose,
  title = 'Заказать звонок',
  action = 'Отправить',
  text = 'Оставьте имя и телефон — перезвоним и ответим на вопросы.',
  children,
  wide = false,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      className={[s.dialog, wide ? s.dialogWide : ''].filter(Boolean).join(' ')}
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
        <p className={s.text}>{text}</p>

        {children ?? <ConsultInline title="" action={action} />}
      </div>
    </dialog>
  );
}
