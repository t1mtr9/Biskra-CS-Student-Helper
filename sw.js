/**
 * The cache name for the service worker.
 * @type {string}
 */
const CACHE = "biskra-cs-v15";

/**
 * The assets to be cached by the service worker.
 * @type {string[]}
 */
const ASSETS = ["./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.png",];


/**
 * The install event listener for the service worker.
 * This is triggered when the service worker is first installed.
 * @param {ExtendableEvent} event - The install event.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

/**
 * The activate event listener for the service worker.
 * This is triggered when the service worker is activated.
 * @param {ExtendableEvent} event - The activate event.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

/**
 * The fetch event listener for the service worker.
 * This is triggered when the browser fetches a resource.
 * @param {FetchEvent} event - The fetch event.
 */
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
