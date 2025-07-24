const cacheName = "scoreboard-v1.4";
const appShellFiles = [
  "/scoreboard-web",
  "/scoreboard-web/index.html",
  "/scoreboard-web/index.min.css",
  "/scoreboard-web/index.min.js",
  "/scoreboard-web/nosleep.min.js",
  "/scoreboard-web/favicon.png",
  "/scoreboard-web/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2",
  "/scoreboard-web/whistle-blow-long.wav",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(appShellFiles).then(() => {
        console.log("[Service Worker] Installed");
        e.currentTarget.clients.matchAll({
          includeUncontrolled: true,
        }).then((clients) => {
          clients.forEach(client => {
            client.postMessage("installed");
          });
        });
      });
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
  caches.delete()
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

self.addEventListener("message", (e) => {
  if (e.data == "delete-cache") {
    e.waitUntil(caches.delete(cacheName));
  }
});