// هذا الكود يبقي السيرفر حياً في خلفية المتصفح
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log("Virus logic persistence active...");
});

// إبقاء الاتصال بالسيرفر مفتوحاً حتى لو أغلق التبويب
setInterval(() => {
    fetch('/ping'); 
}, 10000);
