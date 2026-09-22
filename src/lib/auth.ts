/**
 * Вход в админку по почте.
 *
 * Сайт статический, своего сервера у него нет, поэтому письма и проверку
 * входа берёт на себя Supabase: редактор вводит адрес, получает письмо
 * со ссылкой, по ней возвращается на /admin уже опознанным.
 *
 * Пускают только тех, кого школа завела в списке пользователей: новых
 * по адресу не создаём (create_user: false). Ключи здесь публичные —
 * это адрес проекта и анонимный ключ, они и должны быть видны в браузере
 * (ТЗ §10: секреты — только в переменных окружения, и тайный ключ
 * публикации лежит на стороне Supabase, а не здесь).
 *
 * Пока переменные не заданы, вход выключен и админка работает
 * по-старому — с ключом в браузере редактора.
 */

const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

const STORE = 'sd-admin-session-1';

export type Session = { token: string; refresh: string; email: string };

/** Настроен ли вход по почте. */
export const authReady = url !== '' && key !== '';

function head(token?: string): HeadersInit {
  return {
    apikey: key,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function save(s: Session | null) {
  try {
    if (s) window.localStorage.setItem(STORE, JSON.stringify(s));
    else window.localStorage.removeItem(STORE);
  } catch {
    /* приватный режим: сессия живёт до перезагрузки */
  }
}

function load(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

/** Адрес публикации: функция на стороне Supabase, ключ GitHub там же. */
export function publishEndpoint(): string {
  return `${url}/functions/v1/publish`;
}

/** Письмо со ссылкой для входа. */
export async function sendLink(email: string, back: string): Promise<void> {
  const res = await fetch(`${url}/auth/v1/otp`, {
    method: 'POST',
    headers: head(),
    body: JSON.stringify({ email, create_user: false, options: { email_redirect_to: back } }),
  });
  if (res.ok) return;
  if (res.status === 422 || res.status === 400) {
    throw new Error('такой почты нет в списке допущенных');
  }
  if (res.status === 429) throw new Error('слишком часто — подождите минуту');
  throw new Error(`не отправилось (${res.status})`);
}

/** Кто вошёл: спрашиваем у Supabase, а не верим тому, что лежит в браузере. */
async function whoami(token: string): Promise<string | null> {
  const res = await fetch(`${url}/auth/v1/user`, { headers: head(token) });
  if (!res.ok) return null;
  const data = (await res.json()) as { email?: string };
  return data.email ?? null;
}

async function refreshSession(refresh: string): Promise<Session | null> {
  const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: head(),
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    user?: { email?: string };
  };
  if (!data.access_token || !data.refresh_token) return null;
  const next: Session = {
    token: data.access_token,
    refresh: data.refresh_token,
    email: data.user?.email ?? '',
  };
  save(next);
  return next;
}

/**
 * Разбирает возвращение по ссылке из письма и отдаёт живую сессию.
 * Ссылка приносит ключи в хвосте адреса — убираем их сразу, чтобы
 * они не остались в истории браузера.
 */
export async function restore(): Promise<Session | null> {
  if (!authReady) return null;

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const back = new URLSearchParams(hash);
  const fresh = back.get('access_token');
  const freshRefresh = back.get('refresh_token');

  if (fresh && freshRefresh) {
    window.history.replaceState(null, '', window.location.pathname);
    const email = await whoami(fresh);
    if (email) {
      const s: Session = { token: fresh, refresh: freshRefresh, email };
      save(s);
      return s;
    }
  }

  const kept = load();
  if (!kept) return null;

  const email = await whoami(kept.token);
  if (email) return { ...kept, email };

  /* Ключ протух — меняем его на новый по долгому ключу. */
  return refreshSession(kept.refresh);
}

export async function signOut(session: Session | null): Promise<void> {
  if (session) {
    await fetch(`${url}/auth/v1/logout`, { method: 'POST', headers: head(session.token) }).catch(
      () => {
        /* сеть отвалилась — всё равно забываем сессию в браузере */
      },
    );
  }
  save(null);
}
