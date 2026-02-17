const CACHE = "japa-v2";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./manifest.json"
      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Обрабатываем команду skipWaiting от страницы
self.addEventListener("message", e => {
  if (e.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
