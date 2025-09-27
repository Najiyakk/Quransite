self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("quran-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./quranTranslation.js",
        "./surah_links.html"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
