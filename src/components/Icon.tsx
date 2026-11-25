/**
 * アイコン（自作の線画SVG。外部素材・フォントアイコンは使用しない）
 * 装飾目的のため aria-hidden。意味はとなりの文字で伝える。
 */

export type IconName =
  | 'home'
  | 'rest'
  | 'life'
  | 'feelings'
  | 'settings'
  | 'help'
  | 'card'
  | 'message'
  | 'book'
  | 'steps'
  | 'people'
  | 'together'
  | 'small'
  | 'leave'
  | 'records'
  | 'back'
  | 'close'
  | 'play'
  | 'stop'
  | 'volume'
  | 'mute'
  | 'expand'
  | 'text'
  | 'motion'
  | 'check'
  | 'copy'
  | 'image'
  | 'share'
  | 'trash'
  | 'download'
  | 'external'
  | 'phone'
  | 'chevron'
  | 'refresh'
  | 'info'
  | 'save';

const PATHS: Record<IconName, string> = {
  home: 'M4 11.5 12 5l8 6.5M6.5 10v9h11v-9M10 19v-5h4v5',
  rest: 'M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z',
  life: 'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9ZM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5c-.6 1 .6 1.6 0 2.6M12 3.5c-.6 1 .6 1.6 0 2.6',
  feelings: 'M12 19.5s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.2c0 5-7 9.3-7 9.3Z',
  settings: 'M5 7h9M18 7h1M5 12h3M12 12h7M5 17h7M16 17h3M16 5v4M10 10v4M14 15v4',
  help: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM6 6l3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18',
  card: 'M4.5 6.5h15v11h-15zM8 10.5h8M8 13.5h5',
  message: 'M4.5 6.5h15v11h-15zM5 7l7 5.5L19 7',
  book: 'M12 7.5c-2-1.5-4.5-2-7.5-2v12c3 0 5.5.5 7.5 2 2-1.5 4.5-2 7.5-2v-12c-3 0-5.5.5-7.5 2ZM12 7.5v12',
  steps: 'M5 18.5h4v-4h4v-4h4v-4h2',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19c.5-3.3 2.6-5 5.5-5s5 1.7 5.5 5M16 11a2.5 2.5 0 1 0 0-5M17 14c2 .4 3.2 2 3.5 4.5',
  together: 'M8 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 18.5c.4-3 2-4.5 4.5-4.5 1.6 0 2.9.6 3.7 1.8M12.3 15.8c.8-1.2 2.1-1.8 3.7-1.8 2.5 0 4.1 1.5 4.5 4.5',
  small: 'M12 19.5v-7M12 12.5c0-3 2-5 5.5-5 0 3.2-2 5-5.5 5ZM12 14.5c0-2.5-1.7-4-4.5-4 0 2.6 1.7 4 4.5 4Z',
  leave: 'M5 18.5c4-.5 7-3 9-6.5l4.5-7c-4 .5-8 3-10 6.5L5 18.5ZM9 13.5l3 1',
  records: 'M7 4.5h10v15H7zM10 8.5h4M10 11.5h4M10 14.5h2',
  back: 'M14.5 6 8.5 12l6 6',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  play: 'M8.5 6v12l9.5-6-9.5-6Z',
  stop: 'M7.5 7.5h9v9h-9z',
  volume: 'M4.5 9.5h3l4-3.5v12l-4-3.5h-3zM15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11',
  mute: 'M4.5 9.5h3l4-3.5v12l-4-3.5h-3zM15.5 9.5l5 5M20.5 9.5l-5 5',
  expand: 'M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15',
  text: 'M5.5 6.5h13M12 6.5v12M9 18.5h6',
  motion: 'M4 12c2-4 4-4 6 0s4 4 6 0 3-3 4-1.5',
  check: 'M5.5 12.5l4 4 9-9',
  copy: 'M8.5 8.5h10v11h-10zM15.5 8.5V4.5h-10v11h3',
  image: 'M4.5 5.5h15v13h-15zM4.5 15.5l4-4 3.5 3.5 2.5-2.5 5 4.5M15.5 9.5a1 1 0 1 0 0-.1',
  share: 'M12 15V4.5M8 8.5l4-4 4 4M6.5 12.5v7h11v-7',
  trash: 'M5 7.5h14M9.5 7.5v-2h5v2M7 7.5l1 12h8l1-12M10.5 11v5M13.5 11v5',
  download: 'M12 4.5V15M8 11l4 4 4-4M5.5 19.5h13',
  external: 'M13.5 5.5h5v5M18.5 5.5 11 13M16 13.5v5h-10.5V8H11',
  phone: 'M7 4.5h3l1.5 4-2 1.3a9 9 0 0 0 4.7 4.7l1.3-2 4 1.5v3a1.8 1.8 0 0 1-2 1.8A14.5 14.5 0 0 1 5.2 6.5 1.8 1.8 0 0 1 7 4.5Z',
  chevron: 'M9.5 6l6 6-6 6',
  refresh: 'M18.5 9A7 7 0 0 0 6 7.5L4.5 9M4.5 4.5V9H9M5.5 15A7 7 0 0 0 18 16.5l1.5-1.5M19.5 19.5V15H15',
  info: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 11v5.5M12 7.8v.2',
  save: 'M5.5 4.5h10l3 3v12h-13zM8.5 4.5v4h6v-4M8.5 19.5v-5h7v5',
};

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
