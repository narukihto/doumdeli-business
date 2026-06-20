const CACHE_NAME = 'doumdeli-space-v2'; // تحديث الإصدار لضمان تنشيط التعديلات الجديدة
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// 1. تثبيت التطبيق وتخزين الملفات الأساسية (كودك الأصلي)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// 2. تفعيل السيرفس وركر وتنظيف ملفات الكاش القديمة تلقائياً لعدم ملء ذاكرة الهاتف
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// 3. تشغيل التطبيق وجلب البيانات ديناميكياً وحفظ صور المستودع الموحد
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // إذا كان الاتصال بالإنترنت ناجحاً والطلب قادم من رابط المنتجات الموحد أو يحتوي على صورة
        if (response.status === 200 && (e.request.url.includes('fakestoreapi.com') || e.request.url.includes('image') || e.request.destination === 'image')) {
          const responseClone = response.clone();
          // قم بفتح الكاش وحفظ نسخة من الصور والبيانات لتعمل لاحقاً بدون إنترنت
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // في حال انقطع الإنترنت تماماً في باماكو، قم بجلب النسخة المحفوظة محلياً بسلاسة
        return caches.match(e.request);
      })
  );
});