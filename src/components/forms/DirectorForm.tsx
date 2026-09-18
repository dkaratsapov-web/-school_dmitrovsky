'use client';

import { useState } from 'react';
import { consentText } from '@/content/site';
import s from './director-form.module.css';

/**
 * Письмо директору: полей больше, чем в заявке на звонок.
 *
 * Как и остальные формы сайта, пока никуда не отправляется: получатель
 * не подтверждён (QUESTIONS.md, B-3 и H-5). Поля, проверка и состояние
 * работают, отправка подключается после подтверждения адресата.
 */
export function DirectorForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className={s.form}
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className={s.row}>
        <label className={s.field}>
          <span className={s.label}>Имя и фамилия</span>
          <input className={s.input} type="text" name="name" autoComplete="name" required />
        </label>

        <label className={s.field}>
          <span className={s.label}>Телефон</span>
          <input
            className={s.input}
            type="tel"
            name="phone"
            placeholder="+7 (___) ___-__-__"
            autoComplete="tel"
            required
          />
        </label>
      </div>

      <label className={s.field}>
        <span className={s.label}>Электронная почта</span>
        <input className={s.input} type="email" name="email" autoComplete="email" required />
      </label>

      <label className={s.field}>
        <span className={s.label}>Кто вы</span>
        <select className={s.input} name="role" defaultValue="Родитель">
          <option>Родитель</option>
          <option>Ученик</option>
          <option>Сотрудник школы</option>
          <option>Другое</option>
        </select>
      </label>

      <label className={s.field}>
        <span className={s.label}>Сообщение</span>
        <textarea className={[s.input, s.area].join(' ')} name="message" rows={5} required />
      </label>

      <label className={s.consent}>
        <input className={s.check} type="checkbox" name="consent" required />
        <span>{consentText}</span>
      </label>

      <button className={s.submit} type="submit">
        <span className={s.submitLabel}>Отправить письмо</span>
      </button>

      {sent ? (
        <p className={s.note} role="status">
          Письмо собрано, но отправка пока отключена: не подтверждён получатель обращений.
        </p>
      ) : null}
    </form>
  );
}
