'use client';

import { Component, Suspense, lazy, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import s from './spline-scene.module.css';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * Сцена Spline.
 *
 * Сцена лежит на стороннем хранилище prod.spline.design и весит несколько
 * мегабайт, поэтому подключается не всегда и не сразу:
 *
 * — узкие экраны её не грузят: на телефоне это трафик и нагрев ради
 *   украшения, там остаётся запасная сцена;
 * — при выключенной анимации сцена не подключается вовсе;
 * — пока сцена грузится и если она не загрузилась, показывается запасная.
 *
 * Запасная сцена — обычная разметка, поэтому первый экран не бывает
 * пустым: ни без скрипта, ни без сети, ни при отказе стороннего хранилища.
 */

/** С какой ширины окна сцена вообще подключается. */
const FROM = 768;

type Props = {
  /** Адрес сцены: .splinecode из «Export → Code» в редакторе Spline. */
  scene: string;
  /** Что показывать, пока сцена грузится и если она не загрузилась. */
  fallback: ReactNode;
};

/** Отказ сцены не должен ронять страницу: ловим и показываем запасную. */
class Guard extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch() {
    this.props.onFail();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SplineScene({ scene, fallback }: Props) {
  const [allow, setAllow] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setTimeout(() => setAllow(window.innerWidth >= FROM), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={s.stage}>
      <div className={[s.spare, ready ? s.spareHidden : ''].filter(Boolean).join(' ')}>
        {fallback}
      </div>

      {allow && !failed ? (
        <Guard onFail={() => setFailed(true)}>
          <Suspense fallback={null}>
            <div className={[s.scene, ready ? s.sceneOn : ''].filter(Boolean).join(' ')}>
              <Spline scene={scene} onLoad={() => setReady(true)} />
            </div>
          </Suspense>
        </Guard>
      ) : null}
    </div>
  );
}
