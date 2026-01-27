import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCorsHeaders, errorResponse } from './_lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Handle CORS preflight
        if (handleOptions(req, res)) return;
        setCorsHeaders(res);

        if (req.method !== 'POST') {
            return errorResponse(res, 405, 'Method not allowed. Use POST.');
        }

        const { messages, model } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return errorResponse(res, 400, 'Messages are required and must be an array.');
        }

        const apiKey = process.env.OPENROUTER_API_KEY || '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';
        
        // Debug info (optional, remove in production)
        console.log('Sending request to OpenRouter...');
        console.log('Model:', model || 'deepseek/deepseek-r1:free');
        
        if (typeof fetch === 'undefined') {
            throw new Error('Global fetch is not defined. Node.js version might be < 18.');
        }

        const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://forthix-chatbot.vercel.app',
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
            const errorText = await response.text().catch(() => 'No error body');
            console.error('OpenRouter API Error:', response.status, errorText);
            
            try {
                const errorJson = JSON.parse(errorText);
                return errorResponse(res, response.status, errorJson.error?.message || 'Error from OpenRouter');
            } catch (p) {
                return errorResponse(res, response.status, `Raw Error: ${errorText.substring(0, 100)}`);
            }
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Detailed Chat API Error:', error);
        
        // Return detailed error in response for diagnostics
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            diagnosis: 'Check if OPENROUTER_API_KEY is set in Vercel environment variables and if Node.js version is >= 18.'
        });
    }
}
