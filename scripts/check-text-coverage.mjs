#!/usr/bin/env node
/**
 * Проверка полноты переноса текста (ТЗ §7).
 *
 * Этап 1 запрещает переписывать и сокращать материалы. Внутренние страницы
 * собираются композициями (карточки, сетки, аккордеоны), а не сплошным
 * потоком блоков, поэтому нужно доказательство, что при перекладке ни одна
 * строка не потерялась.
 *
 * Скрипт берёт все текстовые блоки выгрузки и ищет каждый из них в собранном
 * HTML соответствующей страницы. Расхождения выводятся списком.
 *
 * Осознанные исключения (их отсутствие на странице — решение, а не потеря):
 *   — пункты дополнительного меню, продублированные Tilda в тело страницы;
 *   — «р.» — знак валюты от скрытого и пустого блока цены в каталоге мерча;
 *   — «Достижения» — ярлык раскрывающегося блока карточки педагога;
 *   — название школы, которое шаблон ставит подписью на каждую полосу.
 *
 * Запуск: node scripts/check-text-coverage.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'out');

if (!existsSync(OUT)) {
  console.error('Нет папки out/. Соберите сайт: npm run build:preview');
  process.exit(1);
}

const pages = JSON.parse(readFileSync(join(root, 'src/content/pages.generated.json'), 'utf8'));

const NAV_ECHO = new Set([
  'О нас',
  'Педагоги',
  'Вакансии',
  'Документы',
  'Для родителей',
  'Образование',
  'Питание',
  'Безопасность в школе',
  'Партнеры',
]);
const ALLOWED = new Set([
  // Знак валюты от скрытого и пустого блока цены в каталоге мерча.
  'р.',
  // Ярлык раскрывающегося блока в карточке педагога.
  'Достижения',
  // Подпись-водяной знак шаблона, повторённая на каждой полосе.
  'ГБОУ Школа «Дмитровский» г. Москва',
  // Кнопка каталога мерча вела в попап Tilda (#prodpopup), которого на новом
  // сайте нет. Состав товара, который был в попапе, теперь виден в карточке,
  // поэтому кнопка не выводится — см. QUESTIONS.md, пункт D-11.
  'Подробнее',
  // Должность без ФИО и фотографии: карточка педагога в выгрузке неполная —
  // см. QUESTIONS.md, пункт D-12.
  'Учитель информатики',
]);
const MENU_RECORD_TYPE = '976';

/** Текст страницы без разметки, скриптов и стилей. */
function pageText(slug) {
  const file = join(OUT, slug === 'index' ? 'index.html' : `${slug}.html`);
  if (!existsSync(file)) return null;
  const html = readFileSync(file, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ');
  return normalize(html.replace(/<[^>]+>/g, ' '));
}

/**
 * Приводит строку к виду, в котором её можно сравнивать: HTML-сущности
 * раскрыты, неразрывные и повторные пробелы схлопнуты.
 */
function normalize(s) {
  return s
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/﻿/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let missing = 0;
let checked = 0;
const report = [];

for (const page of pages) {
  const text = pageText(page.slug);
  if (text === null) {
    report.push(`✗ ${page.slug}: страница не собрана`);
    missing += 1;
    continue;
  }

  const lost = [];
  for (const record of page.records) {
    if (record.recordType === MENU_RECORD_TYPE) continue;
    for (const block of record.blocks) {
      const pieces =
        block.type === 'paragraph' || block.type === 'heading' || block.type === 'button'
          ? [block.text]
          : block.type === 'list'
            ? block.items
            : [];
      for (const raw of pieces) {
        const piece = normalize(String(raw ?? ''));
        if (!piece) continue;
        if (NAV_ECHO.has(piece) || ALLOWED.has(piece)) continue;
        checked += 1;
        if (!text.includes(piece)) lost.push(piece);
      }
    }
  }

  if (lost.length > 0) {
    missing += lost.length;
    const unique = [...new Set(lost)];
    report.push(`✗ ${page.slug}: не найдено строк — ${unique.length}`);
    for (const l of unique.slice(0, 8)) report.push(`      ${l.slice(0, 100)}`);
    if (unique.length > 8) report.push(`      … и ещё ${unique.length - 8}`);
  }
}

for (const line of report) console.log(line);
console.log(
  `\nПроверено строк: ${checked}. ` + (missing ? `Не найдено: ${missing}.` : 'Все строки на месте.'),
);
process.exit(missing ? 1 : 0);
