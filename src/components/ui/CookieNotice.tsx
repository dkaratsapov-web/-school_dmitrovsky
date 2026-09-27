'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useScrollY } from '@/lib/motion';
import { CallbackModal } from '../forms/CallbackModal';
import { InfoBody } from './InfoBody';
import { legalInfo } from '@/content/landing';
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
  policyLabel: string;
  acceptLabel: string;
};

/* Уведомление не всплывает поверх первого экрана: оно появляется,
   когда человек начал читать страницу. */
const SHOW_AFTER = 320;

export function CookieNotice({ text, policyLabel, acceptLabel }: Props) {
  const accepted = useSyncExternalStore(subscribe, isAccepted, serverSnapshot);
  const y = useScrollY();
  /* Политика конфиденциальности ещё не перенесена отдельной страницей,
     поэтому вместо перехода по несуществующему адресу открывается справка. */
  const [policy, setPolicy] = useState(false);

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
      <div className={s.cookieInner}>
        <p className={s.cookieText}>{text}</p>

        {/* ссылка стоит рядом с кнопкой, а не в конце фразы: в строку
            она вклинивалась в текст и читалась его продолжением */}
        <div className={s.cookieActions}>
          <button type="button" className={s.cookiePolicy} onClick={() => setPolicy(true)}>
            {policyLabel}
          </button>
          <Button variant="primary" size="sm" onClick={accept}>
            {acceptLabel}
          </Button>
        </div>
      </div>

      <CallbackModal
        open={policy}
        onClose={() => setPolicy(false)}
        title={legalInfo.title}
        text={legalInfo.lead ?? ''}
        size="md"
      >
        <InfoBody {...(legalInfo.text ? { text: legalInfo.text } : {})} />
      </CallbackModal>
    </div>
  );
}
