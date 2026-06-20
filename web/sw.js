const CACHE_NAME = 'doumdeli-space-v2';

// Liste des fichiers et images locaux à mettre en cache dès l'installation
// Les chemins sont relatifs au dossier où se trouve index.html et app.js (généralement dans le dossier web)
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './images/1 حزمة حفاضات أطفال .jpg',
  './images/2 حزمة حفاضات أطفال .jpg',
  './images/3 حزمة حفاضات أطفال .jpg',
  './images/4 حزمة حفاضات أطفال .jpg',
  './images/5 حزمة حفاضات أطفال .jpg',
  './images/1 اجهزه.jpg',
  './images/3 اجهزه.jpg',
  './images/5 اجهز.jpg',
  './images/IMG-20260618-WA0056.jpg'
];

// 1. Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Activation et nettoyage automatique des anciens caches
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

// 3. Stratégie de Network First : Priorité au réseau avec sauvegarde pour le mode hors-ligne
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