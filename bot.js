const TelegramBot = require('node-telegram-bot-api');

// Thay token của mày vào đây
const TOKEN = '7578384719:AAE7BWfKE5BQzQ1ExjFyHJ1zqespNccn-Jc';

const bot = new TelegramBot(TOKEN, { polling: true });

const reminders = {}; // Lưu nhắc nhở theo chatId

// 📌 Khi bấm /start => Chỉ hiển thị tin nhắn, KHÔNG CÒN MENU
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Chào mừng bạn đến với bot nhắc nhở! Hãy sử dụng các lệnh sau:\n\n" +
        "/add [nội dung] [HH:MM] [ngày] - Thêm nhắc nhở một lần\n" +
        "/reply [nội dung] [ngày] - Lặp lại nhắc nhở hàng tháng\n" +
        "/all - Hiển thị tất cả nhắc nhở\n" +
        "/remove [số thứ tự] - Xóa nhắc nhở theo số thứ tự");
});

// 📌 Lệnh /add [nội dung] [HH:MM] [ngày]
bot.onText(/\/add (.+) (\d{2}:\d{2})? (\d{1,2})?/, (msg, match) => {
    const chatId = msg.chat.id;
    const content = match[1];
    const time = match[2] || "08:00"; // Mặc định 08:00 nếu không nhập giờ
    const day = match[3] ? parseInt(match[3]) : new Date().getDate(); // Mặc định là hôm nay

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), day, time.split(':')[0], time.split(':')[1]);

    if (targetDate < now) targetDate.setMonth(targetDate.getMonth() + 1);

    if (!reminders[chatId]) reminders[chatId] = [];
    reminders[chatId].push({ type: "one-time", content, time, day, date: targetDate });

    bot.sendMessage(chatId, `✅ Đã đặt nhắc nhở: *${content}* vào lúc *${time}* ngày *${day}*`, { parse_mode: "Markdown" });

    setTimeout(() => {
        bot.sendMessage(chatId, `🔔 Nhắc nhở: *${content}*`, { parse_mode: "Markdown" });
    }, targetDate - now);
});

// 📌 Lệnh /reply [nội dung] [ngày]
bot.onText(/\/reply (.+) (\d{1,2})/, (msg, match) => {
    const chatId = msg.chat.id;
    const content = match[1];
    const day = parseInt(match[2]);

    const now = new Date();
    const time = "08:00"; // Mặc định 08:00
    let targetDate = new Date(now.getFullYear(), now.getMonth(), day, 8, 0);

    if (targetDate < now) targetDate.setMonth(targetDate.getMonth() + 1);

    if (!reminders[chatId]) reminders[chatId] = [];
    reminders[chatId].push({ type: "monthly", content, time, day });

    bot.sendMessage(chatId, `✅ Đã đặt nhắc nhở hàng tháng: *${content}* vào ngày *${day}*`, { parse_mode: "Markdown" });

    setInterval(() => {
        const today = new Date();
        if (today.getDate() === day) {
            bot.sendMessage(chatId, `🔔 [Hằng tháng] Nhắc nhở: *${content}*`, { parse_mode: "Markdown" });
        }
    }, 86400000); // Kiểm tra mỗi ngày (24 giờ)
});

// 📌 Lệnh /all: Hiển thị tất cả nhắc nhở
bot.onText(/\/all/, (msg) => {
    const chatId = msg.chat.id;
    if (!reminders[chatId] || reminders[chatId].length === 0) {
        bot.sendMessage(chatId, "📋 Không có nhắc nhở nào.");
        return;
    }

    let text = "📋 Danh sách nhắc nhở:\n";
    reminders[chatId].forEach((reminder, index) => {
        text += `${index + 1}. *${reminder.content}* - ${reminder.time} (Ngày ${reminder.day})\n`;
    });

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
});

// 📌 Lệnh /remove [số thứ tự]
bot.onText(/\/remove (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const index = parseInt(match[1]) - 1;

    if (!reminders[chatId] || !reminders[chatId][index]) {
        bot.sendMessage(chatId, "❌ Không tìm thấy nhắc nhở này.");
        return;
    }

    const removed = reminders[chatId].splice(index, 1);
    bot.sendMessage(chatId, `✅ Đã xóa nhắc nhở: *${removed[0].content}*`, { parse_mode: "Markdown" });
});
const express = require("express");
const app = express();

// Route đơn giản để Render nhận diện bot đang chạy
app.get("/", (req, res) => {
    res.send("Bot is running!");
});

// Lắng nghe trên cổng Render cung cấp
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
