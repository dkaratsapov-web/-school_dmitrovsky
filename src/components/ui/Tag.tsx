import type { ReactNode } from 'react';
import s from './ui.module.css';

type Props = {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'neutral';
};

export function Tag({ children, tone = 'default' }: Props) {
  const toneClass = tone === 'accent' ? s.tagAccent : tone === 'neutral' ? s.tagNeutral : '';
  return <span className={[s.tag, toneClass].filter(Boolean).join(' ')}>{children}</span>;
}
