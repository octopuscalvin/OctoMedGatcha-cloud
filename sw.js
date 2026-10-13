const CACHE_NAME = 'bencao-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './medData.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
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

// 攔截網路請求，若有快取則讀取快取 (實現離線功能)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 快取中有就回傳，沒有就去網路抓
        return response || fetch(event.request);
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