
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/style.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/manifest.webmanifest"
];
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener(`install`, event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});


self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keyLists => {
            return Promise.all(
                keyLists.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("rmv old", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    )
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if(event.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', event.request.url);
    
event.respondWith(
                caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(event.request);
                });
            })
            );
            return;
        }
event.respondWith(
    caches.open(CACHE_NAME).then( cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      });
    })
  );
});