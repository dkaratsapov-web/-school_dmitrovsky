'use client';

import { useState } from 'react';
import { consentText } from '@/content/site';
import s from './consult-inline.module.css';

type Props = {
  /** Заголовок над полями. Пустая строка — заголовка нет. */
  title: string;
  /** Подпись на кнопке. */
  action?: string;
  /**
   * Раскладка полей: 'row' — в строку (внутри узкого блока),
   * 'stack' — столбцом, поля крупнее. Столбцом форма занимает
   * высоту соседней колонки, а не висит короткой полосой сверху.
   */
  layout?: 'row' | 'stack';
  /** Без верхней линейки и отступа: форма стоит в уже отбитой полосе. */
  flush?: boolean;
  /** Фон под формой: тёмная полоса или светлый блок. */
  tone?: 'dark' | 'light';
  /**
   * Телефон школы под формой: второй путь для тех, кто не хочет ждать
   * ответа на заявку. Заодно закрывает пустоту под полями.
   */
  callPhone?: { display: string; tel: string };
};

/**
 * Компактная форма консультации внутри блока.
 *
 * Как и форма первого экрана, пока никуда не отправляется: получатель
 * заявок с действующего сайта не подтверждён (QUESTIONS.md, B-3).
 * Поля, проверка и состояние работают, отправка подключается после
 * подтверждения адресата (ТЗ §13).
 */
export function ConsultInline({
  title,
  action = 'Получить консультацию',
  layout = 'row',
  flush = false,
  tone = 'dark',
  callPhone,
}: Props) {
  const [sent, setSent] = useState(false);

  /* Столбцом поля стоят просторно — подписи видны над ними.
     В строке места нет, там подпись читает только экранный диктор. */
  const lab = layout === 'stack' ? s.lab : 'visually-hidden';

  return (
    <form
      className={[
        s.form,
        layout === 'stack' ? s.stack : '',
        flush ? s.flush : '',
        tone === 'light' ? s.light : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      {title ? <p className={s.title}>{title}</p> : null}

      <div className={s.fields}>
        <label className={s.field}>
          <span className={lab}>Как вас зовут</span>
          <input
            className={s.input}
            type="text"
            name="name"
            placeholder="Ваше имя"
            autoComplete="name"
            required
          />
        </label>

        <label className={s.field}>
          <span className={lab}>Телефон для связи</span>
          <input
            className={s.input}
            type="tel"
            name="phone"
            placeholder="+7 (___) ___-__-__"
            autoComplete="tel"
            required
          />
        </label>

        <button className={s.submit} type="submit">
          <span className={s.submitLabel}>{action}</span>
        </button>
      </div>

      <label className={s.consent}>
        <input className={s.check} type="checkbox" name="consent" required />
        <span>{consentText}</span>
      </label>

      {callPhone ? (
        <p className={s.alt}>
          Или позвоните:{' '}
          <a className={s.altLink} href={`tel:${callPhone.tel}`}>
            {callPhone.display}
          </a>
        </p>
      ) : null}

      {sent ? (
        <p className={s.note} role="status">
          Форма собрана, но отправка пока отключена: не подтверждён получатель заявок.
        </p>
      ) : null}
    </form>
  );
}
