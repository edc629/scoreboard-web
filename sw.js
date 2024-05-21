const cacheName = "scoreboard-v1";
const appShellFiles = [
  "/scoreboard-web",
  "/scoreboard-web/index.html",
  "/scoreboard-web/index.min.css",
  "/scoreboard-web/index.min.js",
  "/scoreboard-web/nosleep.min.js",
  "/scoreboard-web/favicon.png",
];

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(appShellFiles);
      console.log("[Service Worker] Caching all: app shell and content");
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      cache.put(e.request, response.clone());
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      return response;
    })(),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});