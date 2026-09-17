'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useScrollY } from '@/lib/motion';
import { Button } from './Button';
import s from './ui.module.css';

const STORAGE_KEY = 'sd-cookie-notice';

/* Минимальное внешнее хранилище состояния согласия: чтение из localStorage
   безопасно для SSR и не вызывает каскадных рендеров. */
const listeners = new Set<() => void>();

/** Запасное состояние на случай, когда localStorage недоступен. */
let sessionAccepted = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isAccepted(): boolean {
  if (sessionAccepted) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'accepted';
  } catch {
    // приватный режим: решение хранится только до перезагрузки страницы
    return false;
  }
}

/** На сервере уведомление не рендерится — решение принимается в браузере. */
function serverSnapshot(): boolean {
  return true;
}

type Props = {
  /** Текст уведомления — берётся из текущего наполнения сайта, не сочиняется. */
  text: string;
  policyHref: string;
  policyLabel: string;
  acceptLabel: string;
};

/* Уведомление не всплывает поверх первого экрана: оно появляется,
   когда человек начал читать страницу. */
const SHOW_AFTER = 320;

export function CookieNotice({ text, policyHref, policyLabel, acceptLabel }: Props) {
  const accepted = useSyncExternalStore(subscribe, isAccepted, serverSnapshot);
  const y = useScrollY();

  const accept = useCallback(() => {
    sessionAccepted = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* запись недоступна — уведомление скроется до перезагрузки страницы */
    }
    listeners.forEach((l) => l());
  }, []);

  if (accepted || y < SHOW_AFTER) return null;

  return (
    <div className={s.cookie} role="region" aria-label="Уведомление об использовании cookie">
      <p className={s.cookieText}>
        {text} <a href={policyHref}>{policyLabel}</a>
      </p>
      <div className={s.cookieActions}>
        <Button variant="primary" size="sm" onClick={accept}>
          {acceptLabel}
        </Button>
      </div>
    </div>
  );
}
