/**
 * Публикация материалов сайта.
 *
 * Сюда приходит редактор, вошедший в админку по почте. Функция проверяет,
 * что он и правда вошёл и что его адрес в списке допущенных, и кладёт
 * файлы разделов в ветку сборки. Ключ GitHub живёт только здесь,
 * в секретах Supabase: в браузер он не попадает.
 *
 * Разворачивается один раз:
 *   supabase functions deploy publish --no-verify-jwt
 *   supabase secrets set GITHUB_TOKEN=... ADMIN_EMAILS=... SITE_ORIGIN=...
 *
 * Секреты:
 *   GITHUB_TOKEN  — доступ с правом Contents: Read and write на репозиторий;
 *   ADMIN_EMAILS  — адреса через запятую, кому можно публиковать;
 *   SITE_ORIGIN   — адрес сайта, которому разрешено обращаться к функции.
 */

const OWNER = 'dkaratsapov-web';
const REPO = '-school_dmitrovsky';
const BRANCH = 'claude/wizardly-franklin-g4tq99';
const DIR = 'src/content/data';

/** Правим только файлы разделов: ничего другого через админку не пишется. */
const ALLOWED = ['clubs.json', 'news.json', 'teachers.json', 'reviews.json'];

const origin = Deno.env.get('SITE_ORIGIN') ?? '*';

const cors = {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function reply(status: number, text: string): Response {
  return new Response(text, { status, headers: { ...cors, 'Content-Type': 'text/plain' } });
}

/** Кто пришёл: спрашиваем у Supabase по тому же ключу, что дал браузер. */
async function whoami(token: string): Promise<string | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !key) return null;

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { email?: string };
  return user.email ?? null;
}

async function put(file: string, text: string, token: string): Promise<void> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}/${file}`;
  const head = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const current = await fetch(`${url}?ref=${BRANCH}`, { headers: head });
  const sha = current.ok ? ((await current.json()) as { sha?: string }).sha : undefined;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...head, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Материалы сайта: ${file}`,
      content: btoa(String.fromCharCode(...new TextEncoder().encode(text))),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) throw new Error(`GitHub не принял ${file}: ${res.status}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return reply(405, 'только POST');

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '');
  if (token === '') return reply(401, 'нет входа');

  const email = await whoami(token);
  if (!email) return reply(401, 'вход устарел');

  const allowed = (Deno.env.get('ADMIN_EMAILS') ?? '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length > 0 && !allowed.includes(email.toLowerCase())) {
    return reply(403, 'этому адресу публиковать нельзя');
  }

  const ghToken = Deno.env.get('GITHUB_TOKEN');
  if (!ghToken) return reply(500, 'не задан ключ GitHub');

  let files: Record<string, string> = {};
  try {
    const body = (await req.json()) as { files?: Record<string, string> };
    files = body.files ?? {};
  } catch {
    return reply(400, 'тело запроса не разобрано');
  }

  const names = Object.keys(files);
  if (names.length === 0) return reply(400, 'нечего публиковать');
  if (names.some((n) => !ALLOWED.includes(n))) return reply(400, 'недопустимый файл');

  try {
    for (const name of names) {
      const text = files[name];
      if (typeof text !== 'string') return reply(400, 'файл не текст');
      /* Материалы — это JSON: битый файл уронил бы сборку сайта. */
      JSON.parse(text);
      await put(name, text, ghToken);
    }
  } catch (e) {
    return reply(502, (e as Error).message);
  }

  return reply(200, `опубликовано: ${names.join(', ')} (${email})`);
});
