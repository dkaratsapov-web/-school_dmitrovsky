#!/usr/bin/env python3
"""Слияние присланных частей выгрузки в source/. Заменяет заглушки оригиналами."""
import glob, os, shutil, subprocess, sys, tempfile
from PIL import Image

UPLOADS = '/root/.claude/uploads/efef5e4e-c645-52c8-ac0b-65bdc92538b3'
DEST = 'source'

def dims(p):
    try:
        with Image.open(p) as im: return im.size
    except Exception:
        return (0, 0)

zips = sorted(glob.glob(f'{UPLOADS}/*part*.zip'))
print(f'частей найдено: {len(zips)}')
replaced = added = skipped = 0
details = []

for z in zips:
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['unzip','-q','-o',z,'-d',tmp], check=True)
        base = os.path.join(tmp,'schooldmitrovsky_full_package')
        if not os.path.isdir(base): 
            print('  пропуск, нет ожидаемой папки:', os.path.basename(z)); continue
        for root, _, files in os.walk(base):
            for f in files:
                src = os.path.join(root,f)
                rel = os.path.relpath(src, base)
                dst = os.path.join(DEST, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                if not os.path.exists(dst):
                    shutil.copy2(src,dst); added += 1
                    if rel.startswith('assets/images/'):
                        details.append(('новый', rel, None, dims(src)))
                    continue
                if rel.startswith('assets/images/'):
                    ow, oh = dims(dst); nw, nh = dims(src)
                    if nw*nh > ow*oh:
                        shutil.copy2(src,dst); replaced += 1
                        details.append(('замена', rel, (ow,oh), (nw,nh)))
                    else:
                        skipped += 1
                else:
                    # текст и реестры: берём более свежую копию
                    if os.path.getmtime(src) > os.path.getmtime(dst):
                        shutil.copy2(src,dst); replaced += 1
                    else:
                        skipped += 1

print(f'заменено оригиналами: {replaced}\nдобавлено новых: {added}\nбез изменений: {skipped}')
if details:
    print('\nзамены изображений:')
    for kind, rel, old, new in details[:60]:
        o = f'{old[0]}x{old[1]}' if old else '—'
        print(f'  {kind:7} {os.path.basename(rel)[:44]:44} {o:>12} -> {new[0]}x{new[1]}')
