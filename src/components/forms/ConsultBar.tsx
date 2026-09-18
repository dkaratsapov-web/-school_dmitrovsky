'use client';

import { useState } from 'react';
import { consentText } from '@/content/site';
import s from './consult-bar.module.css';

/**
 * Горизонтальная форма первого экрана: бесплатная консультация.
 *
 * Получатель заявок с действующего сайта пока неизвестен (QUESTIONS.md,
 * пункт B-3), поэтому отправка отключена: форма показывает состояние,
 * но никуда не уходит. Подключается после подтверждения адресата.
 */
export function ConsultBar() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className={s.bar}
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className={s.lead}>
        <span className={s.leadTitle}>Бесплатная консультация</span>
        <span className={s.leadText}>Ответим на вопросы о поступлении и обучении</span>
      </div>

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
          <span className={s.submitLabel}>Оставить заявку</span>
        </button>
      </div>

      <label className={s.consent}>
        <input className={s.check} type="checkbox" name="consent" required />
        <span>{consentText}</span>
      </label>

      {sent ? (
        <p className={s.note} role="status">
          Форма собрана, но отправка пока отключена: не подтверждён получатель заявок.
        </p>
      ) : null}
    </form>
  );
}
