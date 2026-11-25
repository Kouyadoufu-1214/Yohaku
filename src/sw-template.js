/* 余白。Service Worker（ビルド時に自動生成されます。直接編集しないでください）
 *
 * - アプリ本体のファイルだけを端末にキャッシュし、オフラインでも開けるようにします。
 * - 外部サイト（相談窓口など）への通信には一切関与しません。
 * - 利用者の入力内容を扱うことはありません。
 */
const VERSION = '__VERSION__';
const CACHE = `yohaku-${VERSION}`;
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('yohaku-') && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 同一オリジン以外（外部サイト）は扱わない
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // ハッシュルーティングのため、HTML は常に index.html を返す（オフライン時も）
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match('./index.html').then(
          (cached) =>
            cached ||
            fetch(req).catch(() => new Response('オフラインです', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })),
        ),
      ),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        });
      }),
    ),
  );
});
