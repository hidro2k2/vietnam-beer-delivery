// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8523016465:AAHKxLLEX3R80J0E0FtUUCANNiQ94UfhUmY';
const TELEGRAM_CHAT_ID = '6482362126';

// Use serverless function in production, direct API in development
const API_ENDPOINT = import.meta.env.PROD
    ? '/api/telegram'
    : `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

/**
 * Send a message to Telegram
 * @param {string} text - Message text (supports HTML formatting)
 * @param {object} options - Additional options (reply_markup, etc.)
 */
export const sendTelegramMessage = async (text, options = {}) => {
    try {
        let response;

        if (import.meta.env.PROD) {
            // Production: Use Vercel serverless function
            response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    reply_markup: options.reply_markup
                }),
            });
        } else {
            // Development: Direct API call (may have CORS issues, fallback to proxy)
            try {
                response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: text,
                        parse_mode: 'HTML',
                        ...options
                    }),
                });
            } catch (corsError) {
                // If CORS fails, try through a CORS proxy or log for manual testing
                console.log('Development mode: Telegram message would be sent:', text);
                console.log('To test, deploy to Vercel or use the API endpoint manually');
                return { ok: true, development: true };
            }
        }

        const data = await response.json();

        if (!data.ok && !data.success) {
            console.error('Telegram API error:', data);
            return null;
        }

        return data.result || data;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        // Don't block the order flow if Telegram fails
        return null;
    }
};

/**
 * Format price to VND
 */
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
};

/**
 * Send new order notification to Telegram
 * @param {object} order - Order object with customer, items, total
 */
export const sendNewOrderNotification = async (order) => {
    const itemsList = order.items
        .map(item => `  • ${item.name} x${item.qty} - ${formatPrice(item.price * item.qty)}`)
        .join('\n');

    const message = `
🆕 <b>ĐƠN HÀNG MỚI #${order.order_code}</b>
━━━━━━━━━━━━━━━━━
👤 <b>Khách:</b> ${order.customer.name}
📞 <b>SĐT:</b> ${order.customer.phone}
📍 <b>Địa chỉ:</b> ${order.customer.address}
${order.customer.note ? `📝 <b>Ghi chú:</b> ${order.customer.note}` : ''}

🛒 <b>Sản phẩm:</b>
${itemsList}

💰 <b>Tổng tiền:</b> ${formatPrice(order.total)}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}
━━━━━━━━━━━━━━━━━
    `.trim();

    // Inline keyboard for quick actions
    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ Xác nhận', callback_data: `confirm_${order.order_code}` },
                { text: '🚚 Đang giao', callback_data: `delivering_${order.order_code}` }
            ],
            [
                { text: '✔️ Hoàn thành', callback_data: `done_${order.order_code}` },
                { text: '❌ Hủy đơn', callback_data: `cancel_${order.order_code}` }
            ]
        ]
    };

    return await sendTelegramMessage(message, { reply_markup: keyboard });
};

/**
 * Send order status update notification
 */
export const sendOrderStatusUpdate = async (orderCode, status, customerName) => {
    const statusEmoji = {
        'pending': '⏳',
        'confirmed': '✅',
        'delivering': '🚚',
        'done': '✔️',
        'cancelled': '❌'
    };

    const statusText = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'delivering': 'Đang giao hàng',
        'done': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };

    const message = `
${statusEmoji[status] || '📋'} <b>CẬP NHẬT ĐƠN HÀNG</b>

📦 Đơn hàng: <b>#${orderCode}</b>
👤 Khách: ${customerName}
📊 Trạng thái: <b>${statusText[status] || status}</b>
⏰ Lúc: ${new Date().toLocaleString('vi-VN')}
    `.trim();

    return await sendTelegramMessage(message);
};

/**
 * Send daily revenue summary
 */
export const sendRevenueSummary = async (data) => {
    const message = `
📊 <b>BÁO CÁO DOANH THU</b>
━━━━━━━━━━━━━━━━━
📅 Ngày: ${new Date().toLocaleDateString('vi-VN')}

💰 Doanh thu hôm nay: <b>${formatPrice(data.todayRevenue)}</b>
📦 Số đơn hôm nay: <b>${data.todayOrders}</b>

📈 Doanh thu tháng này: <b>${formatPrice(data.monthRevenue)}</b>
📦 Số đơn tháng này: <b>${data.monthOrders}</b>
━━━━━━━━━━━━━━━━━
    `.trim();

    return await sendTelegramMessage(message);
};

export default {
    sendTelegramMessage,
    sendNewOrderNotification,
    sendOrderStatusUpdate,
    sendRevenueSummary
};
