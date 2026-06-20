// ==========================================
// 1. CONFIGURATION DU NOYAU DE CACHE COSMIC
// ==========================================
const CACHE_NAME = 'doumdeli-space-v3';

// المصفوفة الكبرى لتخزين كافة الأصول والـ 29 صورة الفيزيائية لضمان العمل Offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',

  // --- IMAGES : ESPACE BÉBÉ ---
  './images/bebe1.jpg',
  './images/bebe2.jpg',
  './images/bebe3.jpg',
  './images/bebe4.jpg',
  './images/bebe5.jpg',

  // --- IMAGES : ÉLECTRONIQUE ---
  './images/Balance scooter 1 .jpg',
  './images/electro1.jpg',
  './images/electro2.jpg',
  './images/electro3.jpg',
  './images/electro4.jpg',
  './images/electro5.jpg',

  // --- IMAGES : MATÉRIAUX DE CONSTRUCTION ---
  './images/Materiaux de construction1.jpg',
  './images/Materiaux de construction2.jpg',
  './images/Materiaux de construction3.jpg',
  './images/Materiaux de construction4.jpg',
  './images/Materiaux de construction5.jpg',
  './images/Materiaux de construction6.jpg',
  './images/Materiaux de construction7.jpg',

  // --- IMAGES : MERCERIE & COUTURE ---
  './images/Mercerie1.jpg',
  './images/Mercerie2.jpg',
  './images/Mercerie3.jpg',
  './images/Mercerie4.jpg',
  './images/Mercerie5.jpg',
  './images/Mercerie6.jpg',
  './images/Mercerie7.jpg',

  // --- IMAGES : PIÈCES DÉTACHÉES ---
  './images/Pièces détachées1.jpg',
  './images/Pièces détachées4.jpg',
  './images/Pièces détachées5.jpg'
];

// ==========================================
// 2. ÉVÉNEMENT 'INSTALL' : CAPTURE DES SITES
// ==========================================
self.addEventListener('install', (e) => {
  console.log('🛸 [Service Worker] Installation et mise en cache des dimensions statiques...');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // إجبار التثبيت على المتابعة حتى لو تأخر جلب بعض الصور
      return cache.addAll(STATIC_ASSETS)
        .then(() => console.log('✅ [Service Worker] Tous les actifs physiques sont sécurisés dans le cache !'))
        .catch(err => console.log('⚠️ [Service Worker] Échec partiel de mise en cache, vérifiez les noms de fichiers:', err));
    })
  );
  // تفعيل السيرفس وركر فوراً دون انتظار إغلاق المتصفح
  self.skipWaiting();
});

// ==========================================
// 3. ÉVÉNEMENT 'ACTIVATE' : PURGE DES ANCIENNES VERSIONS
// ==========================================
self.addEventListener('activate', (e) => {
  console.log('⚡ [Service Worker] Activation du noyau et nettoyage des anciens caches...');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`🗑️ [Service Worker] Suppression de l'ancien cache obsolète : ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // إجبار السيرفس وركر المفعل على السيطرة على الصفحة الحالية فوراً
  return self.clients.claim();
});

// ==========================================
// 4. ÉVÉNEMENT 'FETCH' : STRATÉGIE INTERDIMENSIONNELLE
// ==========================================
self.addEventListener('fetch', (e) => {
  // تصفح بروتوكولات الـ http و https فقط وتجاهل روابط الامتدادات مثل chrome-extension
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // إذا استجاب الخادم بنجاح، نقوم بفحص وتحديث الكاش ديناميكياً
        if (response.status === 200) {
          const isFakeStoreApi = e.request.url.includes('fakestoreapi.com');
          const isLocalImage = e.request.url.includes('images');
          const isGlobalImage = e.request.destination === 'image';

          if (isFakeStoreApi || isLocalImage || isGlobalImage) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // تخزين أو تحديث العنصر المستدعى في الكاش ليكون جاهزاً للاستخدام لاحقاً بدون نت
              cache.put(e.request, responseClone);
              console.log(`📥 [Service Worker] Élément mis à jour en tâche de fond : ${e.request.url}`);
            });
          }
        }
        return response;
      })
      .catch((error) => { 
        // في حال انقطاع الشبكة تماماً (Offline)، يتم سحب الملف فوراً من الكاش الداخلي
        console.log(`📡 [Service Worker] Mode Hors-ligne activé pour la ressource : ${e.request.url}`);
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // إذا كان الطلب المفقود عبارة عن صورة غير مخزنة، نعيد الصورة الاحتياطية التلقائية من الكاش
          if (e.request.destination === 'image') {
            return caches.match('https://images.unsplash.com/photo-1544816155-12df9643f363?w=500')
              .then(fallbackResponse => fallbackResponse || new Response('', { status: 404, statusText: 'Not Found' }));
          }
        });
      })
  );
});