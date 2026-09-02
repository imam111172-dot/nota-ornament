/* Service worker: menyimpan aplikasi agar bisa dibuka tanpa internet. */
const CACHE = "nota-toko-v2";
const ASET = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASET))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Jaringan dulu bila ada, jatuh ke cache bila offline.
   Halaman dan skrip diambil dengan no-store supaya tidak tertahan aturan
   Cache-Control milik GitHub Pages (600 detik) - tanpa ini, pembaruan baru
   terlihat sampai 10 menit kemudian. Gambar tetap boleh memakai cache
   peramban karena jarang berubah. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  const selaluSegar =
    e.request.mode === "navigate" ||
    /\.(html|js|webmanifest)$/i.test(url.pathname) ||
    url.pathname.endsWith("/");

  const permintaan = selaluSegar
    ? new Request(e.request, { cache: "no-store" })
    : e.request;

  e.respondWith(
    fetch(permintaan)
      .then(res => {
        const salinan = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, salinan)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
