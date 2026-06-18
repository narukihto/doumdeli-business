const CACHE_NAME = 'doumdeli-space-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// تثبيت التطبيق وتخزين الملفات أساسية
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// تشغيل التطبيق وجلب البيانات محلياً بسلاسة
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
