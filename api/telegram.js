// Vercel Serverless Function for Telegram Notifications
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8523016465:AAHKxLLEX3R80J0E0FtUUCANNiQ94UfhUmY';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6482362126';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, reply_markup } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text field' });
        }

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text,
                    parse_mode: 'HTML',
                    reply_markup: reply_markup
                }),
            }
        );

        const data = await telegramResponse.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ error: 'Telegram API error', details: data });
        }

        return res.status(200).json({ success: true, result: data.result });
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
