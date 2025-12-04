// Vercel Serverless Function for Telegram Notifications
const TELEGRAM_BOT_TOKEN = '8523016465:AAHKXLLEX3R8OJ0EOFtUUCANNiQ94UfhUmY';
const TELEGRAM_CHAT_ID = '6482362126';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { text, reply_markup } = req.body || {};

        if (!text) {
            res.status(400).json({ error: 'Missing text field' });
            return;
        }

        // Build request body
        const telegramBody = {
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'HTML'
        };

        if (reply_markup) {
            telegramBody.reply_markup = reply_markup;
        }

        console.log('Sending to Telegram:', telegramBody);

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(telegramBody),
            }
        );

        const data = await telegramResponse.json();
        console.log('Telegram response:', data);

        if (!data.ok) {
            console.error('Telegram API error:', data);
            res.status(500).json({
                error: 'Telegram API error',
                details: data
            });
            return;
        }

        res.status(200).json({ success: true, result: data.result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
