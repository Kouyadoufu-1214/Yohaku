import { useEffect, useState } from 'react';

/**
 * ハッシュ方式の小さなルーター（外部ライブラリなし）。
 * 静的ホスティング（GitHub Pages 等）でサーバー設定なしに動作させるため #/path 形式を使う。
 */
export function currentPath(): string {
  const h = window.location.hash;
  if (!h.startsWith('#/')) return '/';
  const path = h.slice(1).split('?')[0];
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function useRoute(): string {
  const [path, setPath] = useState<string>(currentPath);
  useEffect(() => {
    const onChange = () => {
      // 「本文へ移動」などページ内リンクの #xxx はルート変更として扱わない
      if (window.location.hash && !window.location.hash.startsWith('#/')) return;
      setPath(currentPath());
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export function navigate(path: string): void {
  window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
}

export function href(path: string): string {
  return `#${path.startsWith('/') ? path : `/${path}`}`;
}

/** #/path?key=value の key を読む */
export function queryParam(name: string): string | null {
  const h = window.location.hash;
  const i = h.indexOf('?');
  if (i < 0) return null;
  return new URLSearchParams(h.slice(i + 1)).get(name);
}
