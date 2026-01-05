const CACHE_NAME = 'security-system-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // أضف أي ملفات CSS أو صور هنا إذا وجدت
];

// تثبيت الـ Service Worker وحفظ الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// تفعيل الـ Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated ✅');
});

// معالجة الطلبات لضمان عمل الموقع حتى عند ضعف الإنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
