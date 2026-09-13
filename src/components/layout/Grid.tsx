import type { ReactNode } from 'react';
import s from './layout.module.css';

type Props = {
  children: ReactNode;
  /** Количество колонок на desktop. На tablet — 2, на mobile — 1. */
  cols?: 2 | 3 | 4;
  className?: string;
};

const colsClass = { 2: s.cols2, 3: s.cols3, 4: s.cols4 } as const;

export function Grid({ children, cols = 3, className }: Props) {
  return <div className={[s.grid, colsClass[cols], className].filter(Boolean).join(' ')}>{children}</div>;
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[s.prose, className].filter(Boolean).join(' ')}>{children}</div>;
}
