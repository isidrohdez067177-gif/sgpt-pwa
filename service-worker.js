// Nombre del caché
const CACHE_NAME = "sgpt-cache-v1";

// Archivos a cachear
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "icon-192x192.png",
  "icon-512x512.png"
];

// Instalar y guardar archivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar versiones anteriores
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Intercepción de solicitudes
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {

      // Si el archivo está en caché → devolverlo
      if (response) return response;

      // Si no está → intentar obtenerlo de la red
      return fetch(event.request).catch(() => {
        // Si es navegación y está offline → mostrar index.html offline
        if (event.request.mode === "navigate") {
          return caches.match("index.html");
        }
      });

    })
  );
});
