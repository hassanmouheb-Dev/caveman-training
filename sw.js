const CACHE_NAME = "caveman-v32";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/CavemanLogo.png",
  "./assets/hero-logo.png",
  "./assets/tier-scout.png",
  "./assets/tier-hunter.png",
  "./assets/tier-alpha.png",
  "./assets/tier-apex.png",
  "./assets/age-18-29.png",
  "./assets/age-30-39.png",
  "./assets/age-40-49.png",
  "./assets/age-50-59.png",
  "./assets/age-60plus.png",
  "./assets/Motivational_random1.png",
  "./assets/Motivational_random2.png",
  "./assets/Motivational_random3.png",
  "./assets/Motivational_random4.png",
  "./assets/Motivational_random5.png",
  "./assets/Motivational_random6.png",
  "./assets/Motivational_random7.png",
  "./assets/Motivational_random8.png",
  "./assets/Motivational_random9.png",
  "./assets/Motivational_random10.png",
  "./assets/Motivational_random11.png",
  "./assets/Motivational_closing1.png",
  "./assets/Motivational_closing2.png",
  "./assets/Motivational_closing3.png",
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

self.addEventListener("push", (event) => {
  let data = { title: "CaveMan Training", body: "Your mission awaits." };
  try { data = event.data.json(); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./assets/icon-home.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow("./");
    }),
  );
});
