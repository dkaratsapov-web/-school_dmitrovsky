/**
 * Проверка вёрстки собранного сайта на контрольных ширинах (ТЗ §9).
 *
 * Закрывает пункт 4 обязательной проверки из CLAUDE.md: страницы
 * открываются в браузере на 390, 768, 1280 и 1440 px и проверяются на
 * горизонтальный скролл, выход элементов за пределы экрана, битые
 * изображения, слишком мелкие кликабельные области и количество H1.
 *
 *   node scripts/check-layout.mjs                 # проверить всё
 *   node scripts/check-layout.mjs --shots dir     # ещё и сохранить скриншоты
 *   node scripts/check-layout.mjs --pages a,b     # только указанные страницы
 */
import { chromium } from 'playwright';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Chromium может быть предустановлен в окружении (CI, контейнер) и не
 * совпадать по сборке с тем, что ждёт playwright. Если рядом лежит готовый
 * бинарник — берём его, иначе launch() ищет браузер сам.
 */
const PRESET_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOptions = fs.existsSync(PRESET_CHROMIUM) ? { executablePath: PRESET_CHROMIUM } : {};

const WIDTHS = [390, 768, 1280, 1440];
const OUT_DIR = 'out';

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1] ?? '';
}
const shotsDir = flag('--shots');
const onlyPages = flag('--pages')?.split(',').filter(Boolean) ?? null;

if (!fs.existsSync(OUT_DIR)) {
  console.error(`Нет папки ${OUT_DIR}/. Соберите сайт: npm run build:preview`);
  process.exit(1);
}

const allPages = fs
  .readdirSync(OUT_DIR)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))
  .filter((n) => n !== '_not-found' && n !== '404')
  .sort();

const pages = onlyPages ?? allPages;
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });

/**
 * Статический сервер поверх out/.
 *
 * Через file:// проверять нельзя: в экспорте часть путей абсолютная
 * (/images/...), и браузер ищет их от корня диска — все фотографии
 * «не загружаются», хотя на сайте всё в порядке.
 */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const root = path.resolve(OUT_DIR);
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = path.join(root, url);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
  if (!fs.existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

/** Собирает дефекты вёрстки на текущей ширине. */
function audit() {
  const problems = [];
  const vw = document.documentElement.clientWidth;

  if (document.documentElement.scrollWidth > vw + 1) {
    problems.push(`горизонтальный скролл: ${document.documentElement.scrollWidth} > ${vw}`);
  }

  const h1 = document.querySelectorAll('h1');
  if (h1.length !== 1) problems.push(`H1 на странице: ${h1.length}, должен быть ровно один`);

  // элементы, вылезающие за правый край
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const over = el.closest('[data-allow-overflow]');
      if (over) continue;
      const key = el.tagName + '.' + (el.className?.toString().slice(0, 40) ?? '');
      if (seen.has(key)) continue;
      seen.add(key);
      problems.push(
        `за пределами экрана: <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 50)}"> ` +
          `left=${Math.round(r.left)} right=${Math.round(r.right)}`,
      );
    }
  }

  // битые и не загрузившиеся изображения
  for (const img of document.images) {
    if (!img.complete || img.naturalWidth === 0) {
      problems.push(`изображение не загрузилось: ${img.getAttribute('src')}`);
    }
  }

  // кликабельные области меньше 44px (ТЗ §9)
  const small = [];
  for (const el of document.querySelectorAll('a, button, [role="button"], input, select, textarea')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    // Ссылки внутри текста не обязаны быть 44px — считаем только
    // самостоятельные элементы управления.
    if (el.tagName === 'A' && cs.display.includes('inline') && el.closest('p, li')) continue;

    // Визуально скрытый input (файл, чекбокс): нажимают не по нему,
    // а по подписи или кнопке. Меряем реальную цель — ближайший label.
    const hidden = r.width <= 2 || r.height <= 2 || cs.clipPath !== 'none' || cs.opacity === '0';
    const label = el.closest('label');
    let target = r;
    if (el.tagName === 'INPUT' && (hidden || label)) {
      if (!label) continue;
      target = label.getBoundingClientRect();
    }

    if (target.height < 44 - 0.5) {
      small.push(
        `${el.tagName.toLowerCase()}«${(el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 25)}» ` +
          `${Math.round(target.height)}px`,
      );
    }
  }
  if (small.length) problems.push(`кликабельная область ниже 44px: ${small.slice(0, 5).join('; ')}`);

  return problems;
}

const browser = await chromium.launch(launchOptions);
let failures = 0;
let checks = 0;

for (const name of pages) {
  const file = `${base}/${name}.html`;
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('pageerror', (e) => consoleErrors.push(String(e)));
    await page.goto(file, { waitUntil: 'networkidle' });

    /**
     * Дождаться всех изображений.
     *
     * Прокрутка ненадёжна: на длинных страницах часть картинок с
     * loading="lazy" не успевает загрузиться, и проверка считает их битыми.
     * Поэтому переводим все изображения в eager и ждём событий загрузки.
     */
    await page.evaluate(async () => {
      const imgs = [...document.images];
      for (const img of imgs) img.loading = 'eager';
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
              setTimeout(resolve, 15000);
            }),
        ),
      );
    });
    await page.waitForTimeout(200);

    const problems = await page.evaluate(audit);
    if (consoleErrors.length) problems.push(`ошибка JS: ${consoleErrors[0]}`);
    checks += 1;

    if (shotsDir) {
      await page.screenshot({ path: `${shotsDir}/${name}-${width}.png`, fullPage: true });
    }

    if (problems.length) {
      failures += 1;
      console.log(`\n✗ ${name} @ ${width}px`);
      for (const p of problems) console.log(`    ${p}`);
    }
    await ctx.close();
  }
}

await browser.close();
server.close();

console.log(
  `\nПроверено ${checks} комбинаций (${pages.length} страниц × ${WIDTHS.length} ширин). ` +
    (failures ? `Замечаний на ${failures}.` : 'Замечаний нет.'),
);
process.exit(failures ? 1 : 0);
