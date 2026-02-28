const CACHE = "apexforge3-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // cache same-origin GET only
        try{
          const url = new URL(req.url);
          if (req.method === "GET" && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy));
          }
        }catch{}
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
