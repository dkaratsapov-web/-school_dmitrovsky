import Image from 'next/image';
import type { ImageRef } from '@/content/types';
import s from './media.module.css';

type Props = {
  image: ImageRef;
  sizes?: string;
  priority?: boolean;
};

/**
 * Изображение с подписью. alt берётся из слоя контента;
 * для декоративных изображений alt должен быть пустой строкой (ТЗ §11).
 */
export function Figure({ image, sizes = '(min-width: 1024px) 800px, 100vw', priority = false }: Props) {
  return (
    <figure className={s.figure}>
      <div className={s.figureMedia}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority={priority}
        />
      </div>
      {image.caption ? <figcaption className={s.caption}>{image.caption}</figcaption> : null}
    </figure>
  );
}
