import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import s from './ui.module.css';

type Props = {
  title: string;
  text?: string;
  icon?: IconName;
  action?: ReactNode;
};

export function EmptyState({ title, text, icon = 'info', action }: Props) {
  return (
    <div className={s.empty}>
      <Icon name={icon} size={40} className={s.emptyIcon} />
      <p className={s.emptyTitle}>{title}</p>
      {text ? <p className={s.emptyText}>{text}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', radius }: { height?: number | string; width?: number | string; radius?: string }) {
  return (
    <span
      className={s.skeleton}
      style={{ display: 'block', height, width, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
