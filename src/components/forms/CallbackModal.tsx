'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ConsultInline } from './ConsultInline';
import { asset } from '@/lib/asset';
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
  /**
   * Ширина окна: 'sm' — короткая заявка, 'md' — форма с большим числом
   * полей, 'lg' — материал со снимком: афиша и текст встают в две колонки
   * и окно умещается в экран без прокрутки.
   */
  size?: 'sm' | 'md' | 'lg';
  /** Полоса под содержимым: остаётся на месте, когда окно прокручивают. */
  foot?: React.ReactNode;
  /**
   * Снимки материала. Занимают левую панель окна во всю высоту: школа рисует
   * афиши сама, и уменьшать их до миниатюры рядом с текстом нет смысла.
   * Если снимков несколько, под ними появляется ряд миниатюр.
   */
  media?: readonly Shot[];
};

type Shot = { src: string; width: number; height: number; alt: string };

/**
 * Панель со снимками. Своё состояние и свой ключ: при смене материала
 * панель пересобирается и показывает первый кадр, а не тот, что листали
 * в прошлом окне.
 */
function Gallery({ shots }: { shots: readonly Shot[] }) {
  const [at, setAt] = useState(0);
  const shown = shots[at] ?? shots[0];
  if (!shown) return null;

  return (
    <div className={s.media}>
      <Image
        className={s.shot}
        src={asset(shown.src)}
        alt={shown.alt}
        width={shown.width}
        height={shown.height}
        sizes="(min-width: 760px) 380px, 100vw"
      />

      {shots.length > 1 ? (
        <div className={s.strip} role="tablist" aria-label="Снимки">
          {shots.map((sh, i) => (
            <button
              className={[s.thumb, i === at ? s.thumbOn : ''].filter(Boolean).join(' ')}
              key={sh.src}
              type="button"
              role="tab"
              aria-selected={i === at}
              aria-label={`Снимок ${i + 1} из ${shots.length}`}
              onClick={() => setAt(i)}
            >
              <Image
                className={s.thumbShot}
                src={asset(sh.src)}
                alt=""
                width={sh.width}
                height={sh.height}
                sizes="72px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
  size = 'sm',
  foot,
  media,
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
      className={[s.dialog, size === 'md' ? s.dialogMd : '', size === 'lg' ? s.dialogLg : '']
        .filter(Boolean)
        .join(' ')}
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        /* щелчок по затемнению вокруг окна закрывает его */
        if (e.target === ref.current) onClose();
      }}
    >
      <button className={s.close} type="button" onClick={onClose} aria-label="Закрыть">
        <span className={s.closeBar} />
        <span className={s.closeBar} />
      </button>

      {media?.length ? <Gallery shots={media} key={media[0]?.src} /> : null}

      <div className={s.column}>
        <div className={s.inner}>
          <p className={s.title}>{title}</p>
          {text ? <p className={s.text}>{text}</p> : null}

          {children ?? <ConsultInline title="" action={action} />}
        </div>

        {foot ? <div className={s.foot}>{foot}</div> : null}
      </div>
    </dialog>
  );
}
