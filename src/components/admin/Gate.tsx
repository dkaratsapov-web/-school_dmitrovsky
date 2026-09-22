'use client';

import { useEffect, useState } from 'react';
import { AdminApp } from './AdminApp';
import { authReady, restore, sendLink, signOut } from '@/lib/auth';
import type { Session } from '@/lib/auth';
import s from './admin.module.css';

/**
 * Вход в админку.
 *
 * Пароля нет: редактор вводит рабочую почту и получает письмо со ссылкой.
 * Доступ выдаёт школа — заводит адрес в списке пользователей; по чужой
 * почте письмо не придёт.
 *
 * Пока вход не настроен (нет адреса проекта в переменных сборки),
 * админка открывается сразу: так она и работала до сих пор.
 */
export function Gate() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(!authReady);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    let alive = true;
    void restore().then((s) => {
      if (!alive) return;
      setSession(s);
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!authReady) return <AdminApp />;

  if (!checked) {
    return (
      <div className={s.app}>
        <p className={s.lead}>Проверяем вход…</p>
      </div>
    );
  }

  if (session) {
    return (
      <>
        <div className={s.who}>
          <span className={s.whoName}>{session.email}</span>
          <button
            className={s.small}
            type="button"
            onClick={() => {
              void signOut(session).then(() => setSession(null));
            }}
          >
            Выйти
          </button>
        </div>
        <AdminApp session={session} />
      </>
    );
  }

  return (
    <div className={s.app}>
      <div className={s.enter}>
        <h1 className={s.title}>Материалы сайта</h1>
        <p className={s.lead}>
          Введите рабочую почту — пришлём ссылку для входа. Доступ выдаёт школа: по адресу,
          которого нет в списке, письмо не придёт.
        </p>

        <form
          className={s.enterForm}
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setNote('');
            void sendLink(email.trim(), window.location.href).then(
              () => {
                setBusy(false);
                setNote(`Письмо ушло на ${email.trim()}. Ссылка в нём живёт час.`);
              },
              (err: Error) => {
                setBusy(false);
                setNote(`Письмо не отправилось — ${err.message}`);
              },
            );
          }}
        >
          <label className={s.field}>
            <span className={s.label}>Почта</span>
            <input
              className={s.input}
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </label>

          <button
            className={[s.primary, busy ? s.busy : ''].filter(Boolean).join(' ')}
            type="submit"
            disabled={busy}
          >
            {busy ? 'Отправляю…' : 'Прислать ссылку'}
          </button>
        </form>

        {note ? (
          <p className={s.note} role="status">
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
