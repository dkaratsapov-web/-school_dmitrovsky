#!/usr/bin/env node
/**
 * Отчёт о готовности переноса контента (ТЗ §14, §16).
 *
 * Скрипт ничего не исправляет — он показывает, что ещё не перенесено
 * с действующего сайта: пункты меню без адреса, пустые коллекции,
 * незаполненные контакты и элементы с пометкой REVIEW.
 *
 * Запуск: npm run check:content
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8');
}

function countMatches(source, pattern) {
  return (source.match(pattern) ?? []).length;
}

const nav = read('src/content/navigation.ts');
const site = read('src/content/site.ts');
const collections = read('src/content/collections.ts');

const pendingNav = countMatches(nav, /href:\s*null/g);
const navTotal = countMatches(nav, /label:\s*'/g);

const emptyCollections = [
  ...collections.matchAll(/export const (\w+): readonly [\w<>[\]{},\s|]+ = \[\];/g),
].map((m) => m[1]);

const contactsEmpty = /phones:\s*\[\]/.test(site) && /addresses:\s*\[\]/.test(site);
const metrikaMissing = /yandexMetrikaId:\s*string \| null = null/.test(site);

const rows = [
  ['Пункты меню без подтверждённого URL', `${pendingNav} из ${navTotal}`, pendingNav === 0],
  ['Пустые коллекции контента', emptyCollections.join(', ') || '—', emptyCollections.length === 0],
  ['Контакты (телефоны, адреса)', contactsEmpty ? 'не перенесены' : 'заполнены', !contactsEmpty],
  ['Яндекс Метрика', metrikaMissing ? 'не подключена' : 'подключена', !metrikaMissing],
];

const pad = (str, len) => String(str).padEnd(len, ' ');
const width = Math.max(...rows.map((r) => r[0].length));

console.log('\nГотовность переноса контента (этап 1)\n');
for (const [label, value, ok] of rows) {
  console.log(`  ${ok ? '✓' : '•'}  ${pad(label, width)}   ${value}`);
}

const blocking = rows.filter((r) => !r[2]).length;
console.log(
  blocking === 0
    ? '\nВсё перенесено. Можно переходить к визуальной сверке по каждому URL.\n'
    : `\nОжидает переноса: ${blocking} из ${rows.length}. Источник данных — действующий сайт schooldmitrovsky.ru.\n` +
        'Порядок и требования — docs/INVENTORY.md\n',
);
