const CACHE_NAME = 'bencao-cache-v3';
const urlsToCache = [
  '/OctoMedGatcha-cloud/',
  '/OctoMedGatcha-cloud/index.html',
  '/OctoMedGatcha-cloud/admin.html',
  '/OctoMedGatcha-cloud/medData.js',
  '/OctoMedGatcha-cloud/manifest.json',
  '/OctoMedGatcha-cloud/icon-192.png',
  '/OctoMedGatcha-cloud/icon-512.png'
];

// 安裝 Service Worker 並快取檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求：網路優先 (Network First)，若斷網則退回快取 (Fallback to Cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果有網路且成功抓到新檔案，就把它偷偷存進快取，然後顯示給使用者
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 如果抓取失敗 (例如斷網 / 飛航模式)，就去快取裡找之前存過的舊檔案
        return caches.match(event.request);
      })
  );
});

// 更新快取版本
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});