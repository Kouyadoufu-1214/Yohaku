/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * Content Security Policy.
 * 本番ビルドの index.html に <meta> として埋め込む。
 * （開発サーバーはスタイルをインラインで差し込むため、ビルド時のみ適用する）
 * ホスティング側でヘッダーを設定できる場合は public/_headers も併用する。
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-src 'none'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'yohaku-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<!--CSP-->',
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

/**
 * ビルド後に dist/ 内のファイル一覧からオフライン用 Service Worker を生成する。
 * 外部ライブラリ（Workbox 等）は使わない。
 */
function serviceWorkerPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'yohaku-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const root = outDir;
      const exclude = new Set(['sw.js', '_headers', '_redirects', '.nojekyll', 'robots.txt']);
      const files = listFiles(root)
        .map((f) => relative(root, f).split(sep).join('/'))
        .filter((f) => !exclude.has(f) && !f.endsWith('.map'))
        .sort();
      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update(readFileSync(join(root, f)));
      const version = hash.digest('hex').slice(0, 12);
      const precache = ['./', ...files.map((f) => `./${f}`)];
      const template = readFileSync('src/sw-template.js', 'utf8');
      const sw = template
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(precache, null, 2));
      writeFileSync(join(root, 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), cspPlugin(), serviceWorkerPlugin()],
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 0,
    // 動的 import は使わず単一バンドルにする（更新時に古いチャンクが見つからなくなる事態を避けるため）
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
