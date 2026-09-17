'use client';

import { useState } from 'react';
import { consentText } from '@/content/site';
import s from './consult-inline.module.css';

type Props = {
  /** Заголовок над полями. */
  title: string;
  /** Подпись на кнопке. */
  action?: string;
};

/**
 * Компактная форма консультации внутри блока.
 *
 * Как и форма первого экрана, пока никуда не отправляется: получатель
 * заявок с действующего сайта не подтверждён (QUESTIONS.md, B-3).
 * Поля, проверка и состояние работают, отправка подключается после
 * подтверждения адресата (ТЗ §13).
 */
export function ConsultInline({ title, action = 'Получить консультацию' }: Props) {
  const [sent, setSent] = useState(false);

  return (
    <form
      className={s.form}
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <p className={s.title}>{title}</p>

      <div className={s.fields}>
        <label className={s.field}>
          <span className="visually-hidden">Ваше имя</span>
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
          <span className="visually-hidden">Телефон</span>
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

      <p className={s.consent}>{consentText}</p>

      {sent ? (
        <p className={s.note} role="status">
          Форма собрана, но отправка пока отключена: не подтверждён получатель заявок.
        </p>
      ) : null}
    </form>
  );
}
