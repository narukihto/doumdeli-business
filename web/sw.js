const CACHE_NAME = 'doumdeli-space-v2';

// Liste des fichiers et images locaux à mettre en cache dès l'installation
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './images/1حزمة حفاضات أطفال .jpg',
  './images/2حزمة حفاضات أطفال .jpg',
  './images/3حزمة حفاضات أطفال .jpg',
  './images/4حزمة حفاضات أطفال .jpg',
  './images/5حزمة حفاضات أطفال .jpg',
  './images/1اجهزه.jpg',
  './images/3اجهزه.jpg',
  './images/5اجهز.jpg',
  './images/IMG-20260618-WA0056.jpg'
];

// 1. Installation du Service Worker et mise en cache des ressources stables
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Activation et nettoyage automatique des anciens caches pour libérer l'espace
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

// 3. Stratégie de Network First : Priorité au réseau avec sauvegarde dynamique pour le mode hors-ligne
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si la requête est réussie, on sauvegarde dynamiquement les images et l'API
        if (response.status === 200 && (
            e.request.url.includes('fakestoreapi.com') || 
            e.request.url.includes('image') || 
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
        // Si internet coupe, on récupère directement les données depuis le cache local
        return caches.match(e.request);
      })
  );
});