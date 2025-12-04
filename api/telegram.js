// Vercel Serverless Function for Telegram Bot
const TELEGRAM_BOT_TOKEN = '8523016465:AAHKXLLEX3R8OJ0EOFtUUCANNiQ94UfhUmY';
const TELEGRAM_CHAT_ID = '6482362126';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Supabase connection for order management
const SUPABASE_URL = 'https://xyzcompany.supabase.co'; // Will be replaced by env var
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

/**
 * Send message to Telegram
 */
async function sendMessage(chatId, text, options = {}) {
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options
    };

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    return response.json();
}

/**
 * Answer callback query (acknowledge button press)
 */
async function answerCallback(callbackQueryId, text = '') {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text: text
        }),
    });
}

/**
 * Edit message (update buttons after action)
 */
async function editMessage(chatId, messageId, text) {
    await fetch(`${TELEGRAM_API}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML'
        }),
    });
}

/**
 * Handle commands from user
 */
async function handleCommand(command, chatId) {
    switch (command) {
        case '/start':
            return sendMessage(chatId, `
🍺 <b>Chào mừng đến Beer Delivery Manager!</b>

Bot này giúp bạn quản lý đơn hàng:
• Nhận thông báo đơn mới tự động
• Cập nhật trạng thái đơn hàng
• Xem thống kê doanh thu

Sử dụng /help để xem các lệnh.
            `.trim());

        case '/help':
            return sendMessage(chatId, `
📋 <b>DANH SÁCH LỆNH</b>

/orders - Xem tất cả đơn hàng
/pending - Đơn hàng mới (chờ xử lý)
/delivering - Đơn đang giao
/done - Đơn hoàn thành
/today - Doanh thu hôm nay
/revenue - Thống kê doanh thu
/help - Hiển thị trợ giúp này
            `.trim());

        case '/orders':
        case '/pending':
        case '/delivering':
        case '/done':
            return sendMessage(chatId, `
📦 <b>Tính năng đang phát triển</b>

Vui lòng truy cập Admin Dashboard để xem danh sách đơn hàng:
👉 https://vietnam-beer-delivery.vercel.app/admin/dashboard
            `.trim());

        case '/today':
        case '/revenue':
            return sendMessage(chatId, `
📊 <b>Tính năng đang phát triển</b>

Vui lòng truy cập Admin Dashboard để xem thống kê:
👉 https://vietnam-beer-delivery.vercel.app/admin/stats
            `.trim());

        default:
            return sendMessage(chatId, '❓ Lệnh không hợp lệ. Sử dụng /help để xem các lệnh.');
    }
}

/**
 * Handle button callbacks
 */
async function handleCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const callbackId = callbackQuery.id;

    // Parse callback data: action_orderCode
    const [action, orderCode] = data.split('_');

    const statusMap = {
        'confirm': { status: 'confirmed', text: '✅ Đã xác nhận', emoji: '✅' },
        'delivering': { status: 'delivering', text: '🚚 Đang giao hàng', emoji: '🚚' },
        'done': { status: 'done', text: '✔️ Hoàn thành', emoji: '✔️' },
        'cancel': { status: 'cancelled', text: '❌ Đã hủy', emoji: '❌' }
    };

    const statusInfo = statusMap[action];
    if (!statusInfo) {
        await answerCallback(callbackId, '❓ Hành động không hợp lệ');
        return;
    }

    // Acknowledge the button press
    await answerCallback(callbackId, statusInfo.text);

    // Update the message to show status changed
    const originalText = callbackQuery.message.text;
    const updatedText = `${originalText}\n\n${statusInfo.emoji} <b>Trạng thái:</b> ${statusInfo.text}`;

    await editMessage(chatId, messageId, updatedText);

    // Send confirmation
    await sendMessage(chatId, `
${statusInfo.emoji} <b>CẬP NHẬT THÀNH CÔNG</b>

📦 Đơn hàng: <b>#${orderCode}</b>
📊 Trạng thái mới: <b>${statusInfo.text}</b>

⚠️ <i>Lưu ý: Vui lòng cập nhật trạng thái trên Admin Dashboard để đồng bộ với hệ thống.</i>
👉 https://vietnam-beer-delivery.vercel.app/admin/dashboard
    `.trim());
}

/**
 * Main handler
 */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const body = req.body || {};

        // Check if this is a webhook update from Telegram
        if (body.update_id) {
            // Handle text message/command
            if (body.message && body.message.text) {
                const text = body.message.text;
                const chatId = body.message.chat.id;

                if (text.startsWith('/')) {
                    await handleCommand(text, chatId);
                }
            }

            // Handle callback query (button press)
            if (body.callback_query) {
                await handleCallback(body.callback_query);
            }

            res.status(200).json({ ok: true });
            return;
        }

        // Otherwise, this is a notification request from our website
        const { text, reply_markup } = body;

        if (!text) {
            res.status(400).json({ error: 'Missing text field' });
            return;
        }

        const telegramBody = {
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'HTML'
        };

        if (reply_markup) {
            telegramBody.reply_markup = reply_markup;
        }

        const telegramResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramBody),
        });

        const data = await telegramResponse.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            res.status(500).json({ error: 'Telegram API error', details: data });
            return;
        }

        res.status(200).json({ success: true, result: data.result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
