'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { ImageRef } from '@/content/types';
import s from './media.module.css';

/** Галерея с увеличением по клику. Состав и подписи не меняются при переносе. */
export function Gallery({ images, label = 'Фотогалерея' }: { images: readonly ImageRef[]; label?: string }) {
  const [active, setActive] = useState<ImageRef | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className={s.gallery} role="group" aria-label={label}>
        {images.map((img) => (
          <button
            key={img.src}
            type="button"
            className={s.galleryItem}
            onClick={() => setActive(img)}
            aria-label={img.alt === '' ? 'Открыть изображение' : `Открыть: ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </button>
        ))}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.caption ?? active?.alt ?? 'Фотография'}
      >
        {active ? (
          <Image
            src={active.src}
            alt={active.alt}
            width={active.width}
            height={active.height}
            sizes="(min-width: 768px) 700px, 100vw"
          />
        ) : null}
      </Modal>
    </>
  );
}
