'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { VideoRef } from '@/content/types';
import s from './media.module.css';

/**
 * Видео подключается только по клику: без автозапуска, без звука,
 * без загрузки стороннего плеера до действия пользователя (ТЗ §4).
 */
export function VideoEmbed({ video }: { video: VideoRef }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={s.video}>
        <iframe
          src={video.url}
          title={video.title}
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={s.video}>
      <button
        type="button"
        className={s.videoPoster}
        onClick={() => setPlaying(true)}
        aria-label={`Воспроизвести видео: ${video.title}`}
      >
        {video.poster ? (
          <Image
            src={video.poster.src}
            alt=""
            width={video.poster.width}
            height={video.poster.height}
            sizes="(min-width: 1024px) 900px, 100vw"
          />
        ) : null}
        <span className={s.playBadge}>
          <span className={s.playCircle}>
            <Icon name="play" size={32} />
          </span>
        </span>
      </button>
    </div>
  );
}
