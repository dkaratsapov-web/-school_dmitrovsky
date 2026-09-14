#!/usr/bin/env python3
"""
Сборка слоя контента из извлечённых блоков.

Читает source/extracted/*.json, сопоставляет изображения с локальными
файлами по реестру source/data/assets.json, копирует используемые
изображения в public/images и генерирует src/content/pages.generated.json.

Тексты переносятся без изменений (ТЗ §7).
"""
import json, glob, os, re, shutil, collections
from PIL import Image

EXTRACTED = 'source/extracted'
PUBLIC = 'public/images'
OUT = 'src/content/pages.generated.json'

# служебные картинки шаблона Tilda и счётчики — в контент не идут
SKIP_NAMES = re.compile(
    r'(tildacopy|vector[-_]?\d*|group_2\d{3}|counter2|^1\.gif$)', re.I
)


def key(u):
    m = re.search(r'/(tild[0-9a-f-]+)/', u)
    if not m:
        return None
    name = u.split('?')[0].rstrip('/').split('/')[-1]
    return (m.group(1), name.lower())


MAX_SIDE = 1600


def convert(src, dst):
    """WebP с ограничением длинной стороны. Оригинал остаётся в source/."""
    with Image.open(src) as im:
        im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
        if max(im.size) > MAX_SIDE:
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=82, method=4)
        return im.size


SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+')


def short(text, limit=90):
    """Первое предложение, обрезанное до разумной длины."""
    first = SENTENCE_SPLIT.split(text.strip())[0].strip()
    if len(first) <= limit:
        return first
    cut = first[:limit].rsplit(' ', 1)[0]
    return cut.rstrip(',;:—-') + '…'


def page_heading(page):
    return (page['title'].split(',')[0] or page['slug']).strip()


def assign_alt(pages):
    """
    Проставляет alt по видимому контексту страницы.

    ТЗ §23: alt формируется по контексту, имя файла смысловым alt не является,
    выдуманные факты недопустимы. Поэтому описание берётся из ближайшего
    заголовка или текста рядом с изображением — того, что читатель видит
    вокруг снимка, — а не из догадок о его содержимом.

    Итоговые формулировки подлежат вычитке школой: кто и что именно
    изображён, знает только она. См. QUESTIONS.md.
    """
    filled = 0
    for page in pages:
        head = page_heading(page)
        for record in page['records']:
            blocks = record['blocks']
            for i, b in enumerate(blocks):
                if b['type'] != 'image' or b.get('alt'):
                    continue
                context = None
                # ближайший предшествующий заголовок или текст в том же блоке
                for j in range(i - 1, -1, -1):
                    prev = blocks[j]
                    if prev['type'] == 'heading':
                        context = prev['text']
                        break
                    if prev['type'] == 'paragraph' and len(prev['text']) > 25:
                        context = prev['text']
                        break
                # иначе — ближайший следующий текст
                if context is None:
                    for j in range(i + 1, len(blocks)):
                        nxt = blocks[j]
                        if nxt['type'] == 'heading':
                            context = nxt['text']
                            break
                        if nxt['type'] == 'paragraph' and len(nxt['text']) > 25:
                            context = nxt['text']
                            break
                b['alt'] = f'Фотография к материалу «{short(context)}»' if context else f'Фотография: {head}'
                filled += 1
    print(f'проставлено alt по контексту: {filled}')


def main():
    assets = json.load(open('source/data/assets.json'))
    amap = {}
    for a in assets:
        k = key(a['source_url'])
        if k and a.get('local_path'):
            amap[k] = a['local_path']

    os.makedirs(PUBLIC, exist_ok=True)
    copied = {}
    pages = []
    missing = collections.Counter()

    for f in sorted(glob.glob(f'{EXTRACTED}/*.json')):
        d = json.load(open(f))
        records = []
        for r in d['records']:
            blocks = []
            for b in r['blocks']:
                if b['type'] != 'image':
                    blocks.append(b)
                    continue
                k = key(b['url'])
                local = amap.get(k) if k else None
                if not local:
                    missing[b['url']] += 1
                    continue
                name = os.path.basename(local)
                if SKIP_NAMES.search(name):
                    continue
                src = os.path.join('source', local)
                if not os.path.exists(src):
                    continue
                try:
                    with Image.open(src) as im:
                        w, h = im.size
                except Exception:
                    continue
                # служебные размеры отбрасываем
                if w < 200 or h < 200:
                    continue
                out_name = os.path.splitext(name)[0] + '.webp'
                if out_name not in copied:
                    copied[out_name] = convert(src, os.path.join(PUBLIC, out_name))
                w, h = copied[out_name]
                blocks.append({
                    'type': 'image',
                    'src': f'/images/{out_name}',
                    'alt': b.get('alt', ''),
                    'width': w,
                    'height': h,
                })
            if blocks:
                records.append({'id': r['id'], 'recordType': r['recordType'], 'blocks': blocks})
        pages.append({
            'slug': d['slug'],
            'title': d['title'],
            'description': d['description'],
            'records': records,
        })
        n_img = sum(1 for r in records for b in r['blocks'] if b['type'] == 'image')
        n_txt = sum(1 for r in records for b in r['blocks'] if b['type'] in ('paragraph', 'heading', 'list'))
        print(f'  {d["slug"]:18} текст: {n_txt:4}  фото: {n_img:4}')

    assign_alt(pages)
    json.dump(pages, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print(f'\nскопировано изображений: {len(copied)}')
    print(f'не нашлось соответствий: {len(missing)} адресов')
    if missing:
        json.dump(sorted(missing), open('docs/missing-images-unmatched.txt', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
