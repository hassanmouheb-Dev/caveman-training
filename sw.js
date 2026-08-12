const CACHE_NAME = "caveman-v9";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/hero-logo.png",
  "./assets/icon-home.png",
  "./assets/icon-program.png",
  "./assets/icon-progress.png",
  "./assets/icon-profile.png",
  "./assets/tier-scout.png",
  "./assets/tier-hunter.png",
  "./assets/tier-alpha.png",
  "./assets/tier-apex.png",
  "./assets/age-18-29.png",
  "./assets/age-30-39.png",
  "./assets/age-40-49.png",
  "./assets/age-50-59.png",
  "./assets/age-60plus.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// Cache-first for the app shell so it keeps working with zero connectivity;
// falls back to network (and caches the result) for anything not yet cached.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    }),
  );
});
