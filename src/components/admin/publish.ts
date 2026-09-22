/**
 * Публикация материалов на сайт.
 *
 * Сайт собирается из файлов репозитория, поэтому «опубликовать» —
 * значит положить новый файл раздела в ветку, из которой идёт сборка.
 * Делает это сам браузер редактора: ключ доступа хранится только
 * в его хранилище и в репозиторий не попадает (ТЗ §10).
 *
 * После записи файла GitHub сам пересобирает сайт — это две-три минуты.
 */

export const repo = {
  owner: 'dkaratsapov-web',
  name: '-school_dmitrovsky',
  /** Ветка, из которой собирается сайт (.github/workflows/pages.yml). */
  branch: 'claude/wizardly-franklin-g4tq99',
  dir: 'src/content/data',
} as const;

/** Base64 для текста с кириллицей: btoa сам по себе её не берёт. */
function base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function url(file: string): string {
  return `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${repo.dir}/${file}`;
}

/** Понятное объяснение вместо кода ошибки. */
function explain(status: number): string {
  if (status === 401) return 'ключ не принят — проверьте, что он скопирован целиком';
  if (status === 403) return 'у ключа нет прав на запись в репозиторий';
  if (status === 404) return 'репозиторий или файл не найден — проверьте права ключа';
  if (status === 409) return 'файл успели изменить — обновите страницу и повторите';
  if (status === 422) return 'GitHub не принял файл';
  return `ошибка ${status}`;
}

/** Кладёт файл раздела в ветку сборки. */
export async function publishFile(token: string, file: string, text: string): Promise<void> {
  const head = headers(token);

  /* Чтобы переписать файл, GitHub требует отпечаток текущей версии. */
  const current = await fetch(`${url(file)}?ref=${repo.branch}`, { headers: head });
  if (!current.ok && current.status !== 404) throw new Error(explain(current.status));
  const sha = current.ok ? ((await current.json()) as { sha?: string }).sha : undefined;

  const res = await fetch(url(file), {
    method: 'PUT',
    headers: { ...head, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Материалы сайта: ${file}`,
      content: base64(text),
      branch: repo.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) throw new Error(explain(res.status));
}
