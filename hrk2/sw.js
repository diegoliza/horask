const CACHE_NAME = 'control-horarios-cache-v1';
// Lista de archivos para guardar en caché para que la app funcione offline.
const FILES_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Evento de instalación: se ejecuta cuando el Service Worker se instala.
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // Espera a que el caché se abra y todos los archivos se agreguen.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Evento de activación: limpia cachés antiguos.
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Evento de fetch: se ejecuta para cada solicitud que hace la página.
self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // Si la solicitud no es de tipo GET, no la manejamos.
  if (evt.request.method !== 'GET') {
      return;
  }
  // Estrategia: Cache, falling back to network
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
        .then((response) => {
          // Si encontramos una respuesta en caché, la devolvemos.
          // Si no, hacemos la solicitud a la red.
          return response || fetch(evt.request).then((response) => {
            // Opcional: podrías clonar y guardar la nueva respuesta en caché aquí.
            return response;
          });
        });
    })
  );
});