import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCorsHeaders, errorResponse } from './_lib/middleware.js';
import https from 'https';

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

        const apiKey = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
        
        if (!apiKey) {
            return errorResponse(res, 401, 'OpenRouter API key is not configured.');
        }

        console.log('Using API Key:', apiKey.substring(0, 10) + '...');

        const postData = JSON.stringify({
            model: model || 'deepseek/deepseek-r1:free',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional stock market expert. Your goal is to provide insights and information related to stocks, markets, and finance ONLY. If the user asks anything unrelated to the stock market or finance, politely decline and ask them to stay on topic.',
                },
                ...messages,
            ],
        });

        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://forthix-chatbot.vercel.app',
                'X-Title': 'Forthix Chatbot',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000 // 30 seconds
        };

        const responseData = await new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', (chunk) => { data += chunk; });
                response.on('end', () => {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        body: data
                    });
                });
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request to OpenRouter timed out'));
            });

            request.write(postData);
            request.end();
        }) as any;

        if (responseData.statusCode < 200 || responseData.statusCode >= 300) {
            console.error('OpenRouter Error Status:', responseData.statusCode);
            console.error('OpenRouter Error Body:', responseData.body);
            
            try {
                const errorJson = JSON.parse(responseData.body);
                return errorResponse(res, responseData.statusCode, errorJson.error?.message || 'Error from OpenRouter');
            } catch (p) {
                return errorResponse(res, responseData.statusCode, `Raw Error: ${responseData.body.substring(0, 100)}`);
            }
        }

        const finalData = JSON.parse(responseData.body);
        return res.status(200).json(finalData);

    } catch (error: any) {
        console.error('Detailed Chat API Error:', error);
        
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            cause: error.cause ? error.cause.message : undefined,
            code: error.code,
            diagnosis: 'Network request failed. Check if Vercel has outgoing access to api.openrouter.ai and if the API key is correct.'
        });
    }
}
