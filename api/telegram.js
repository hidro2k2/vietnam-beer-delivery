// Vercel Serverless Function for Telegram Notifications
export const config = {
    runtime: 'edge',
};

const TELEGRAM_BOT_TOKEN = '8523016465:AAHKxLLEX3R80J0E0FtUUCANNiQ94UfhUmY';
const TELEGRAM_CHAT_ID = '6482362126';

export default async function handler(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { text, reply_markup } = body;

        if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text field' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
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
            return new Response(JSON.stringify({ error: 'Telegram API error', details: data }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        return new Response(JSON.stringify({ success: true, result: data.result }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
