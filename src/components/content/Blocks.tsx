import Image from 'next/image';
import { Gallery } from '../media/Gallery';
import { RichText } from './RichText';
import { asset } from '@/lib/asset';
import type { PageBlock } from '@/content/pages-data';
import s from './blocks.module.css';

/**
 * Рендер блоков страницы.
 *
 * Идущие подряд изображения собираются в галерею, текст — в колонку
 * комфортной ширины. Содержание не меняется: порядок, формулировки и состав
 * ровно такие, как на действующем сайте (ТЗ §7).
 */

type ImageBlock = Extract<PageBlock, { type: 'image' }>;
type Group = { kind: 'text'; blocks: PageBlock[] } | { kind: 'images'; images: ImageBlock[] };

function group(blocks: readonly PageBlock[]): Group[] {
  const out: Group[] = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.type === 'image') {
      if (last && last.kind === 'images') last.images.push(b);
      else out.push({ kind: 'images', images: [b] });
    } else {
      if (last && last.kind === 'text') last.blocks.push(b);
      else out.push({ kind: 'text', blocks: [b] });
    }
  }
  return out;
}

function Text({ blocks }: { blocks: readonly PageBlock[] }) {
  return (
    <div className={s.prose}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading': {
            const Tag = b.level === 2 ? 'h2' : b.level === 3 ? 'h3' : 'h4';
            return <Tag key={i}>{b.text}</Tag>;
          }
          case 'paragraph':
            return (
              <p key={i}>
                <RichText text={b.text} />
              </p>
            );
          case 'list':
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <RichText text={it} />
                  </li>
                ))}
              </ul>
            );
          case 'video':
            return (
              <div key={i} className={s.video}>
                <iframe src={b.url} title={b.title ?? 'Видео'} allowFullScreen loading="lazy" />
              </div>
            );
          case 'button':
            return (
              <p key={i}>
                <a className={s.inlineAction} href={b.href}>
                  {b.text}
                </a>
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function Blocks({ blocks }: { blocks: readonly PageBlock[] }) {
  const groups = group(blocks);
  return (
    <>
      {groups.map((g, i) => {
        if (g.kind === 'text') return <Text key={i} blocks={g.blocks} />;
        const first = g.images[0];
        if (g.images.length === 1 && first) {
          return (
            <figure key={i} className={s.single}>
              <Image
                src={asset(first.src)}
                alt={first.alt}
                width={first.width}
                height={first.height}
                sizes="(min-width: 1024px) 900px, 100vw"
              />
            </figure>
          );
        }
        return (
          <div key={i} className={s.galleryWrap}>
            <Gallery
              images={g.images.map((im) => ({
                src: asset(im.src),
                alt: im.alt,
                width: im.width,
                height: im.height,
              }))}
            />
          </div>
        );
      })}
    </>
  );
}
