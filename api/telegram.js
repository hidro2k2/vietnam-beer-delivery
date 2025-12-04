// Vercel Serverless Function for Telegram Bot with Supabase Integration
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = '8523016465:AAHKXLLEX3R8OJ0EOFtUUCANNiQ94UfhUmY';
const TELEGRAM_CHAT_ID = '6482362126';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Supabase connection
const SUPABASE_URL = 'https://xvcereevlxybmdvcfost.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2VyZWV2bHh5Ym1kdmNmb3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjIwNjYsImV4cCI6MjA3OTg5ODA2Nn0.PFuaFbneZvqUA-JuDnqnaqJoaCcb6MwKIVy_tfQkgOc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
            text: text,
            show_alert: true
        }),
    });
}

/**
 * Edit message with new buttons
 */
async function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
    await fetch(`${TELEGRAM_API}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: replyMarkup
        }),
    });
}

/**
 * Get buttons based on order status
 */
function getButtonsForStatus(orderCode, status) {
    switch (status) {
        case 'pending':
            return {
                inline_keyboard: [
                    [
                        { text: '🚚 Nhận đơn & Giao hàng', callback_data: `delivering_${orderCode}` }
                    ],
                    [
                        { text: '❌ Hủy đơn', callback_data: `cancel_${orderCode}` }
                    ]
                ]
            };
        case 'delivering':
            return {
                inline_keyboard: [
                    [
                        { text: '✅ Hoàn thành đơn', callback_data: `done_${orderCode}` }
                    ],
                    [
                        { text: '❌ Hủy đơn', callback_data: `cancel_${orderCode}` }
                    ]
                ]
            };
        case 'done':
            return {
                inline_keyboard: [
                    [
                        { text: '✔️ Đã hoàn thành', callback_data: 'noop' }
                    ]
                ]
            };
        case 'cancelled':
            return {
                inline_keyboard: [
                    [
                        { text: '❌ Đã hủy', callback_data: 'noop' }
                    ]
                ]
            };
        default:
            return { inline_keyboard: [] };
    }
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
• Cập nhật trạng thái đơn hàng trực tiếp
• Đồng bộ với website real-time

Sử dụng /help để xem các lệnh.
            `.trim());

        case '/help':
            return sendMessage(chatId, `
📋 <b>DANH SÁCH LỆNH</b>

/pending - Xem đơn hàng mới
/delivering - Xem đơn đang giao
/done - Xem đơn hoàn thành
/stats - Thống kê nhanh
/help - Hiển thị trợ giúp
            `.trim());

        case '/pending':
            return await showOrdersByStatus(chatId, 'pending', '⏳ ĐƠN HÀNG MỚI');

        case '/delivering':
            return await showOrdersByStatus(chatId, 'delivering', '🚚 ĐƠN ĐANG GIAO');

        case '/done':
            return await showOrdersByStatus(chatId, 'done', '✅ ĐƠN HOÀN THÀNH');

        case '/stats':
            return await showStats(chatId);

        default:
            return sendMessage(chatId, '❓ Lệnh không hợp lệ. Sử dụng /help để xem các lệnh.');
    }
}

/**
 * Show orders by status
 */
async function showOrdersByStatus(chatId, status, title) {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!orders || orders.length === 0) {
            return sendMessage(chatId, `${title}\n\n📭 Không có đơn hàng nào.`);
        }

        let message = `${title}\n━━━━━━━━━━━━━━━━━\n\n`;

        for (const order of orders) {
            const time = new Date(order.created_at).toLocaleString('vi-VN');
            const total = new Intl.NumberFormat('vi-VN').format(order.total);
            message += `📦 <b>#${order.order_code}</b>\n`;
            message += `👤 ${order.customer_name}\n`;
            message += `💰 ${total}₫\n`;
            message += `⏰ ${time}\n\n`;
        }

        message += `Tổng: <b>${orders.length}</b> đơn`;

        return sendMessage(chatId, message);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return sendMessage(chatId, '❌ Có lỗi khi tải đơn hàng.');
    }
}

/**
 * Show quick stats
 */
async function showStats(chatId) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all orders
        const { data: allOrders, error } = await supabase
            .from('orders')
            .select('*');

        if (error) throw error;

        const pending = allOrders.filter(o => o.status === 'pending').length;
        const delivering = allOrders.filter(o => o.status === 'delivering').length;
        const done = allOrders.filter(o => o.status === 'done').length;

        // Today's revenue
        const todayOrders = allOrders.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= today && o.status === 'done';
        });
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

        const message = `
📊 <b>THỐNG KÊ NHANH</b>
━━━━━━━━━━━━━━━━━

⏳ Đơn mới: <b>${pending}</b>
🚚 Đang giao: <b>${delivering}</b>
✅ Hoàn thành: <b>${done}</b>

💰 Doanh thu hôm nay: <b>${new Intl.NumberFormat('vi-VN').format(todayRevenue)}₫</b>
📦 Đơn hoàn thành hôm nay: <b>${todayOrders.length}</b>
        `.trim();

        return sendMessage(chatId, message);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return sendMessage(chatId, '❌ Có lỗi khi tải thống kê.');
    }
}

/**
 * Handle button callbacks - UPDATE SUPABASE DIRECTLY
 */
async function handleCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const callbackId = callbackQuery.id;

    // Ignore noop callbacks
    if (data === 'noop') {
        await answerCallback(callbackId, 'Đơn hàng đã được xử lý');
        return;
    }

    // Parse callback data: action_orderCode
    const [action, orderCode] = data.split('_');

    // First, get current order status from database
    const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', orderCode)
        .single();

    if (fetchError || !orderData) {
        await answerCallback(callbackId, '❌ Không tìm thấy đơn hàng!');
        return;
    }

    const currentStatus = orderData.status;

    // Validate state transitions
    const validTransitions = {
        'pending': ['delivering', 'cancel'],
        'delivering': ['done', 'cancel'],
        'done': [],
        'cancelled': []
    };

    const newStatus = action === 'cancel' ? 'cancelled' : action;

    if (!validTransitions[currentStatus]?.includes(action === 'cancel' ? 'cancel' : newStatus)) {
        await answerCallback(callbackId, `⚠️ Không thể chuyển từ "${currentStatus}" sang "${newStatus}"`);
        return;
    }

    // Handle cancel - DELETE from database
    if (action === 'cancel') {
        const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .eq('order_code', orderCode);

        if (deleteError) {
            await answerCallback(callbackId, '❌ Lỗi khi hủy đơn!');
            return;
        }

        await answerCallback(callbackId, '🗑️ Đã hủy và xóa đơn hàng!');

        // Update buttons to show cancelled
        await editMessageReplyMarkup(chatId, messageId, getButtonsForStatus(orderCode, 'cancelled'));

        // Send confirmation
        await sendMessage(chatId, `
❌ <b>ĐÃ HỦY ĐƠN HÀNG</b>

📦 Mã đơn: <b>#${orderCode}</b>
👤 Khách: ${orderData.customer_name}
🗑️ Đơn hàng đã bị xóa khỏi hệ thống
⏰ Lúc: ${new Date().toLocaleString('vi-VN')}
        `.trim());
        return;
    }

    // Update status in Supabase
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('order_code', orderCode);

    if (updateError) {
        await answerCallback(callbackId, '❌ Lỗi khi cập nhật!');
        return;
    }

    const statusInfo = {
        'delivering': { text: '🚚 Đang giao hàng', alert: 'Đã nhận đơn! Bắt đầu giao hàng.' },
        'done': { text: '✅ Hoàn thành', alert: 'Đơn hàng đã hoàn thành!' }
    };

    const info = statusInfo[newStatus];

    // Acknowledge button press
    await answerCallback(callbackId, info.alert);

    // Update buttons based on new status
    await editMessageReplyMarkup(chatId, messageId, getButtonsForStatus(orderCode, newStatus));

    // Send confirmation message
    await sendMessage(chatId, `
${info.text.split(' ')[0]} <b>CẬP NHẬT THÀNH CÔNG</b>

📦 Mã đơn: <b>#${orderCode}</b>
👤 Khách: ${orderData.customer_name}
📍 Địa chỉ: ${orderData.customer_address}
📊 Trạng thái: <b>${info.text}</b>
⏰ Lúc: ${new Date().toLocaleString('vi-VN')}
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
                    await handleCommand(text.split('@')[0], chatId);
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
