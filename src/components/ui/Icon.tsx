import type { SVGProps } from 'react';

/**
 * Единый линейный набор иконок (ТЗ §4: один набор, не смешивать стили).
 * 24×24, stroke 1.6, currentColor. Новые иконки добавлять только сюда.
 */
export type IconName =
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-right'
  | 'maximize'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'clock'
  | 'calendar'
  | 'document'
  | 'download'
  | 'external'
  | 'play'
  | 'search'
  | 'eye'
  | 'check'
  | 'alert'
  | 'info'
  | 'users'
  | 'upload';

const paths: Record<IconName, string> = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M6 6l12 12M18 6L6 18',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'arrow-right': 'M4 12h15m0 0l-6-6m6 6l-6 6',
  /* углы рамки: «показать крупнее» */
  maximize: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  phone:
    'M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.7 2 2 0 016.5 3.5z',
  mail: 'M3 6.5h18v11H3zM3 7l9 6 9-6',
  pin: 'M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 7.5V12l3 2',
  calendar: 'M4 6.5h16v14H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4',
  document: 'M6 3.5h7l5 5v12H6zM13 3.5v5h5M9 13h6M9 16.5h6',
  download: 'M12 4v10m0 0l-4-4m4 4l4-4M5 19h14',
  external: 'M14 4h6v6M20 4l-8.5 8.5M18 14v5H5V6h5',
  play: 'M9 7.5l8 4.5-8 4.5z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.9-3.9',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z M12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  check: 'M4.5 12.5l5 5 10-11',
  alert: 'M12 8.5v5m0 3.2v.1M10.3 4l-7 12.2A2 2 0 005 19.2h14a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5.5M12 7.7v.1',
  users:
    'M15.5 20v-1.7a3.8 3.8 0 00-3.8-3.8H6.8A3.8 3.8 0 003 18.3V20M9.2 11.2a3.6 3.6 0 100-7.2 3.6 3.6 0 000 7.2M21 20v-1.7a3.8 3.8 0 00-2.9-3.7M15.6 4.2a3.8 3.8 0 010 7',
  upload: 'M12 16V6m0 0L8 10m4-4l4 4M5 19h14',
};

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  title?: string;
};

export function Icon({ name, size = 24, title, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={paths[name]} />
    </svg>
  );
}
