import type { ElementType, ReactNode } from 'react';
import s from './layout.module.css';

type Props = {
  children: ReactNode;
  narrow?: boolean;
  as?: ElementType;
  className?: string;
};

export function Container({ children, narrow = false, as: Tag = 'div', className }: Props) {
  return (
    <Tag className={[s.container, narrow ? s.containerNarrow : '', className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
