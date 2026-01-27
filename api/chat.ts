import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCorsHeaders, errorResponse } from './_lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed. Use POST.');
    }

    try {
        const { messages, model } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return errorResponse(res, 400, 'Messages are required and must be an array.');
        }

        const apiKey = process.env.OPENROUTER_API_KEY || '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';
        
        const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://forthix.vercel.app', // You can update this or use req.headers.host
                'X-Title': 'Forthix Chatbot',
            },
            body: JSON.stringify({
                model: model || 'deepseek/deepseek-r1:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional stock market expert. Your goal is to provide insights and information related to stocks, markets, and finance ONLY. If the user asks anything unrelated to the stock market or finance, politely decline and ask them to stay on topic.',
                    },
                    ...messages,
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter API Error:', errorData);
            return errorResponse(res, response.status, errorData.error?.message || 'Error from OpenRouter');
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return errorResponse(res, 500, error.message || 'Internal server error');
    }
}
