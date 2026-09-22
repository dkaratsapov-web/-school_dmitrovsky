/**
 * Готовит уменьшённые копии снимков.
 *
 * Сайт статический: на GitHub Pages некому уменьшать картинки на лету,
 * поэтому размеры делаются заранее, а браузер берёт подходящий по srcset.
 * Без этого телефон качал снимок в 1400 px, чтобы показать его в 220.
 *
 * Копии лежат отдельной папкой public/_img (`/_img/images/snimok-640.webp`),
 * чтобы не мешаться с присланными файлами, а список исходных ширин —
 * в src/content/images.generated.json: его читает загрузчик next/image.
 */
import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Тот же ряд читает загрузчик: src/lib/image-loader.ts. */
const WIDTHS = [320, 480, 768, 1080, 1440];
const DIRS = ['public/images', 'public/video'];
const OUT = 'src/content/images.generated.json';
/** Куда складываются копии: папка собирается заново и не хранится в git. */
const COPIES = 'public/_img';
const SUFFIX = /-(\d+)\.webp$/;

/** Сколько файлов режем одновременно: больше — только греем процессор. */
const LANES = 8;

async function listSources(dir) {
  if (!existsSync(dir)) return [];
  const names = await readdir(dir);
  return names
    .filter((n) => n.endsWith('.webp') && !SUFFIX.test(n))
    .map((n) => path.join(dir, n));
}

async function variants(file) {
  const meta = await sharp(file).metadata();
  const src = meta.width ?? 0;
  const made = [];

  for (const w of WIDTHS) {
    /* Копия шире оригинала бессмысленна: увеличивать нечего. */
    if (w >= src) continue;
    const out = path.join(COPIES, path.relative('public', file)).replace(/\.webp$/, `-${w}.webp`);
    if (existsSync(out)) {
      const [a, b] = await Promise.all([stat(file), stat(out)]);
      if (b.mtimeMs >= a.mtimeMs) {
        made.push(w);
        continue;
      }
    }
    await mkdir(path.dirname(out), { recursive: true });
    await sharp(file).resize({ width: w }).webp({ quality: 78, effort: 4 }).toFile(out);
    made.push(w);
  }

  return { key: `/${path.relative('public', file).split(path.sep).join('/')}`, made, src };
}

async function main() {
  const files = (await Promise.all(DIRS.map(listSources))).flat();
  const map = {};
  let made = 0;

  for (let i = 0; i < files.length; i += LANES) {
    const chunk = files.slice(i, i + LANES);
    const done = await Promise.all(chunk.map(variants));
    for (const d of done) {
      /* В список идёт ширина оригинала: какие копии из неё получились,
         загрузчик выведет сам по тому же ряду размеров. */
      if (d.made.length > 0) map[d.key] = d.src;
      made += d.made.length;
    }
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(map)}\n`);
  console.log(`снимки: ${files.length} исходных, ${made} уменьшённых копий`);
}

await main();
