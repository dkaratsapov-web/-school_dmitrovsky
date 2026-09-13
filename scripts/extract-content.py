#!/usr/bin/env python3
"""
Извлечение контента страниц из исходного HTML действующего сайта.

Читает source/source_html/*.html, отбрасывает общую обвязку (шапка, меню,
подвал, попапы, cookie) и сохраняет оставшиеся блоки по порядку
в source/extracted/<slug>.json.

Тексты не редактируются: переносится ровно то, что опубликовано (ТЗ §7).
"""
from bs4 import BeautifulSoup
import glob, json, os, re, sys

SRC = 'source/source_html'
OUT = 'source/extracted'
CHROME = {
    'rec777298635', 'rec735770035', 'rec741677649', 'rec2037180041',
    'rec740249208', 'rec735845294', 'rec780812945', 'rec762747433',
    'rec735782587', 'rec735841982', 'rec735843982', 'rec777300085',
    'rec2337058301',
}

HEADING = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}


def clean(s):
    return ' '.join((s or '').split())


def img_url(tag):
    for attr in ('data-original', 'data-img-src', 'src'):
        u = tag.get(attr)
        if u and '/tild' in u:
            return u
    return None


def bg_url(tag):
    u = tag.get('data-original')
    if u and '/tild' in u:
        return u
    style = tag.get('style') or ''
    m = re.search(r'url\(["\']?(https://[^"\')]+/tild[^"\')]+)', style)
    return m.group(1) if m else None


def walk(node, out, seen):
    """Обходит дерево сверху вниз, собирая блоки в порядке появления."""
    for el in node.descendants:
        if not getattr(el, 'name', None):
            continue
        if id(el) in seen:
            continue

        if el.name == 'img':
            u = img_url(el)
            if u:
                seen.add(id(el))
                out.append({'type': 'image', 'url': u, 'alt': clean(el.get('alt'))})
            continue

        if el.name in ('iframe',):
            src = el.get('src') or el.get('data-src')
            if src:
                seen.add(id(el))
                out.append({'type': 'video', 'url': src, 'title': clean(el.get('title'))})
            continue

        classes = el.get('class') or []

        # Zero Block: содержимое лежит в .tn-atom
        if 'tn-atom' in classes:
            img = el.find('img')
            u = img_url(img) if img else bg_url(el)
            t = clean(el.get_text(' ', strip=True))
            if t:
                out.append({'type': 'paragraph', 'text': t})
            elif u:
                out.append({'type': 'image', 'url': u, 'alt': ''})
            for d in el.descendants:
                seen.add(id(d))
            continue

        # фоновые изображения блоков
        if any(c.startswith('t-bgimg') for c in classes) or el.get('data-original'):
            u = bg_url(el)
            if u:
                out.append({'type': 'image', 'url': u, 'alt': ''})

        if el.name in HEADING or any(c in ('t-title', 't-heading') for c in classes):
            t = clean(el.get_text(' ', strip=True))
            if t and len(t) < 400:
                lvl = int(el.name[1]) if el.name in HEADING else 2
                out.append({'type': 'heading', 'level': min(max(lvl, 2), 4), 'text': t})
                for d in el.descendants:
                    seen.add(id(d))
            continue

        if any(c in ('t-text', 't-descr', 't-name', 't-uptitle') for c in classes):
            # списки внутри текстового блока сохраняем как списки
            lis = el.find_all('li')
            if lis:
                items = [clean(li.get_text(' ', strip=True)) for li in lis]
                items = [i for i in items if i]
                if items:
                    out.append({'type': 'list', 'items': items})
            else:
                t = clean(el.get_text(' ', strip=True))
                if t:
                    out.append({'type': 'paragraph', 'text': t})
            for d in el.descendants:
                seen.add(id(d))
            continue

        if el.name == 'a' and any('btn' in c for c in classes):
            t = clean(el.get_text(' ', strip=True))
            href = el.get('href')
            if t and href:
                out.append({'type': 'button', 'text': t, 'href': href})
            for d in el.descendants:
                seen.add(id(d))
            continue


def dedupe(blocks):
    """Убирает подряд идущие повторы одного и того же содержимого."""
    res = []
    for b in blocks:
        key = json.dumps(b, ensure_ascii=False, sort_keys=True)
        if res and json.dumps(res[-1], ensure_ascii=False, sort_keys=True) == key:
            continue
        res.append(b)
    return res


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for f in sorted(glob.glob(f'{SRC}/*.html')):
        slug = os.path.basename(f)[:-5]
        soup = BeautifulSoup(open(f, encoding='utf-8', errors='ignore').read(), 'lxml')
        title = clean(soup.title.get_text()) if soup.title else ''
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        desc = clean(desc_tag.get('content')) if desc_tag else ''

        for tag in soup(['script', 'style', 'noscript']):
            tag.decompose()

        records = []
        for r in soup.select('div.t-rec'):
            rid = r.get('id')
            if rid in CHROME:
                continue
            blocks = []
            walk(r, blocks, set())
            blocks = dedupe(blocks)
            if blocks:
                records.append({'id': rid, 'recordType': r.get('data-record-type'), 'blocks': blocks})

        data = {'slug': slug, 'title': title, 'description': desc, 'records': records}
        json.dump(data, open(f'{OUT}/{slug}.json', 'w'), ensure_ascii=False, indent=1)
        nb = sum(len(r['blocks']) for r in records)
        total += nb
        print(f'  {slug:18} блоков: {len(records):3}  элементов: {nb:4}')
    print(f'\nвсего элементов контента: {total}')


if __name__ == '__main__':
    main()
