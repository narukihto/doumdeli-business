const CACHE_NAME = 'doumdeli-space-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './images/Balance scooter 1 .jpg',
  './images/bebe1.jpg',
  './images/bebe2.jpg',
  './images/bebe3.jpg',
  './images/bebe4.jpg',
  './images/bebe5.jpg',
  './images/electro1.jpg',
  './images/electro2.jpg',
  './images/electro3.jpg',
  './images/electro4.jpg',
  './images/electro5.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.status === 200 && (
            e.request.url.includes('fakestoreapi.com') || 
            e.request.url.includes('images') || 
            e.request.destination === 'image'
        )) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});