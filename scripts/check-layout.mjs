#!/usr/bin/env node
/**
 * Проверка вёрстки на контрольных ширинах (CLAUDE.md, пункт 4).
 *
 * Обходит страницы на 390, 768, 1280 и 1440 px и ищет:
 * горизонтальный скролл, элементы за правым краем окна, битые изображения,
 * число H1 и ответы с ошибкой.
 *
 * Запуск: node scripts/check-layout.mjs [базовый-адрес]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3300/-school_dmitrovsky';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WIDTHS = [390, 768, 1280, 1440];
const PATHS = [
  '/', '/o-nas/', '/5-8class/', '/10-11class/', '/teachers/', '/contacts/',
  '/kadetskii-class/', '/documents/', '/merch/', '/vakansii/', '/kruzhki/', '/detskii-sad/',
];

const browser = await chromium.launch({ executablePath: CHROME });
let problems = 0;

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 } });
  const page = await ctx.newPage();

  for (const path of PATHS) {
    const resp = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);

    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      const over = [];

      /* Элемент, обрезанный любым предком, за край не вылезает:
         это намеренно сдвинутый слой (параллакс), а не дефект. */
      const isClipped = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p);
          if (o.overflowX !== 'visible' || o.overflow === 'clip') return true;
        }
        return false;
      };

      for (const el of document.querySelectorAll('main *, header *, footer *')) {
        const rc = el.getBoundingClientRect();
        if (!rc.width || !rc.height) continue;
        if (rc.right > doc.clientWidth + 1 && !isClipped(el)) {
          over.push(el.tagName + '.' + String(el.className).split(' ')[0].slice(0, 30));
        }
      }

      const imgs = [...document.images];
      return {
        pageOver: doc.scrollWidth > doc.clientWidth + 1,
        over: [...new Set(over)].slice(0, 4),
        h1: document.querySelectorAll('h1').length,
        broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      };
    });

    const bad = r.pageOver || r.over.length > 0 || r.h1 !== 1 || r.broken > 0 || resp.status() >= 400;
    if (bad) {
      problems += 1;
      console.log(
        `ПРОБЛЕМА ${path} @${width}  http=${resp.status()}  скролл=${r.pageOver ? 'ЕСТЬ' : 'нет'}` +
          `  за_край=${r.over.join(', ') || 'нет'}  h1=${r.h1}  битых=${r.broken}`,
      );
    }
  }
  await ctx.close();
}

await browser.close();

const total = WIDTHS.length * PATHS.length;
console.log(
  problems === 0
    ? `вёрстка: проблем нет — ${PATHS.length} страниц × ${WIDTHS.length} ширины (${total} проверок)`
    : `вёрстка: проблем ${problems} из ${total}`,
);
process.exit(problems === 0 ? 0 : 1);
