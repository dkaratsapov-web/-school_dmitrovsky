'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import type { Item } from './fields';
import s from './admin.module.css';

/**
 * Превью материала: как он встанет на сайте.
 *
 * Каждое окно — настоящая страница сайта с одним материалом, открытая
 * в своей ширине: 1200 px и 390 px. Телефонная вёрстка включается
 * по ширине окна, поэтому показать её уменьшением карточки нельзя —
 * нужно именно узкое окно.
 *
 * Материал уходит в окно сообщением при каждой правке: печатаешь
 * название — оно меняется в превью.
 */

type FrameProps = {
  label: string;
  /** Ширина окна, в которой открывается сайт. */
  view: number;
  /** Высота окна, пока материал не сообщил свою. */
  tall: number;
  tab: string;
  item: Item | undefined;
};

function Frame({ label, view, tall, tab, item }: FrameProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [k, setK] = useState(1);
  const [high, setHigh] = useState(tall);

  /* Окно широкое, панель админки уже — показываем его уменьшенным,
     сохраняя пропорции: это тот же экран, только меньше. */
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? view;
      setK(Math.min(1, w / view));
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, [view]);

  /* Материал в окно: при каждой правке и после загрузки окна. */
  useEffect(() => {
    const send = () => {
      if (!item) return;
      frameRef.current?.contentWindow?.postMessage(
        { type: 'sd-preview', tab, item },
        window.location.origin,
      );
    };
    send();

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== frameRef.current?.contentWindow) return;
      const d = e.data as { type?: string; height?: number } | null;
      if (d?.type === 'sd-preview-ready') send();
      if (d?.type === 'sd-preview-size' && typeof d.height === 'number') {
        setHigh(Math.min(1400, Math.max(180, Math.round(d.height))));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [tab, item]);

  return (
    <div className={s.pane}>
      <span className={s.paneLabel}>
        {label} <span className={s.paneSize}>{view} px</span>
      </span>

      <div className={s.paneBox} ref={boxRef} style={{ height: `${Math.round(high * k)}px` }}>
        <iframe
          className={s.paneFrame}
          ref={frameRef}
          src={asset('/admin/preview/')}
          title={`Превью: ${label}`}
          style={{
            width: `${view}px`,
            height: `${high}px`,
            transform: `scale(${k})`,
          }}
        />
      </div>
    </div>
  );
}

export function Preview({ tab, item }: { tab: string; item: Item | undefined }) {
  const [open, setOpen] = useState(true);
  if (!item) return null;

  return (
    <div className={s.stage}>
      <button
        className={s.stageHead}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Как это выглядит на сайте
        <span className={s.stageHint}>{open ? 'свернуть' : 'компьютер и телефон'}</span>
      </button>

      {open ? (
        <div className={s.panes}>
          <Frame label="Компьютер" view={1200} tall={760} tab={tab} item={item} />
          <Frame label="Телефон" view={390} tall={720} tab={tab} item={item} />
        </div>
      ) : null}
    </div>
  );
}
