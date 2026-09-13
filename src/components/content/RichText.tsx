import { Fragment } from 'react';
import type { ReactNode } from 'react';

/**
 * Делает кликабельными телефоны и ссылки внутри перенесённого текста.
 *
 * В материалах действующего сайта телефоны и адреса форм записи набраны
 * обычным текстом прямо в абзацах: «…узнать подробнее вы можете по телефону:
 * +7 (915) 412-54-50», «Запись по ссылке обязательна: https://forms.yandex.ru/…».
 * На телефоне такой номер не набрать, а ссылку не открыть.
 *
 * Символы текста не меняются: компонент только оборачивает уже написанное
 * в `tel:` и `href` (ТЗ §7).
 */

/*
 * Регулярные выражения с флагом g хранят позицию поиска, поэтому общий
 * экземпляр на модуль делиться между вызовами не должен: создаём новый.
 */

/** Ссылка с протоколом. Разбираем её первой, чтобы цифры пути не стали телефоном. */
const urlRe = () => /https?:\/\/[^\s,;)»"']+/g;

/**
 * Российский номер телефона в любом из написаний, что встречаются в текстах:
 * «+7 (495) 143-21-21», «+7 915 412 54 50», «8-925-762-44-48».
 */
const phoneRe = () => /(?:\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g;

/** Без разделителей это не номер, а кусок цифрового кода. */
function looksLikePhone(value: string): boolean {
  return /[\s\-()]/.test(value);
}

/** Значение для tel:. Ведущая восьмёрка приводится к +7. */
function telHref(value: string): string {
  const digits = value.replace(/\D/g, '');
  const national = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
  return `+${national}`;
}

/** Убирает точку или запятую, прилипшую к концу ссылки в предложении. */
function trimTrailing(url: string): { href: string; tail: string } {
  const match = /[.,!?]+$/.exec(url);
  if (!match) return { href: url, tail: '' };
  return { href: url.slice(0, match.index), tail: match[0] };
}

function linkPhones(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  const re = phoneRe();

  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    if (!looksLikePhone(m[0])) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <a key={`${keyPrefix}-tel-${m.index}`} href={`tel:${telHref(m[0])}`}>
        {m[0]}
      </a>,
    );
    last = m.index + m[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  const re = urlRe();

  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    if (m.index > last) parts.push(...linkPhones(text.slice(last, m.index), `u${m.index}`));
    const { href, tail } = trimTrailing(m[0]);
    parts.push(
      <a key={`url-${m.index}`} href={href} target="_blank" rel="noopener noreferrer">
        {href}
      </a>,
    );
    if (tail) parts.push(tail);
    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(...linkPhones(text.slice(last), 'end'));

  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
