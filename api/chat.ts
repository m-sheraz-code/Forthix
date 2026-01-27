import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCorsHeaders, errorResponse } from './_lib/middleware.js';
import https from 'https';

import { getQuote, getChartData } from './_lib/yahoo-finance.js';

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

        console.log('Using API Key:', apiKey.substring(0, 5) + '...');

        // --- STOCK DATA INJECTION ---
        let contextData = "";
        
        // 1. Extract potential symbols from the last user message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
            const content = lastMessage.content || "";
            // Regex to find potential tickers: 2-5 uppercase letters, optionally prefixed with $
            const tickerRegex = /\b\$?([A-Z]{2,5})\b/g;
            const matches = [...content.matchAll(tickerRegex)].map(m => m[1]);
            // Filter unique, limit to top 2 to save tokens
            const uniqueSymbols = [...new Set(matches)].slice(0, 2);

            if (uniqueSymbols.length > 0) {
                console.log(`Found potential symbols: ${uniqueSymbols.join(', ')}`);
                
                const stockContexts = await Promise.all(uniqueSymbols.map(async (sym) => {
                    try {
                        const [quote, chart] = await Promise.all([
                            getQuote(sym),
                            getChartData(sym, '1mo')
                        ]);

                        if (!quote) return null;

                        // Create a summary of the monthly trend
                        let trendInfo = "No historical data available.";
                        if (chart && chart.length > 0) {
                            const startPrice = chart[0].close;
                            const endPrice = chart[chart.length - 1].close;
                            const monthChange = ((endPrice - startPrice) / startPrice) * 100;
                            const highest = Math.max(...chart.map(d => d.high));
                            const lowest = Math.min(...chart.map(d => d.low));
                            
                            trendInfo = `
                            - 1-Month Trend: ${monthChange > 0 ? 'UP' : 'DOWN'} (${monthChange.toFixed(2)}%)
                            - Month High: ${highest.toFixed(2)}
                            - Month Low: ${lowest.toFixed(2)}
                            - Last 30 Days Volatility: Captured in chart data.
                            `;
                        }

                        return `
                        [REAL-TIME STOCK DATA FOR ${sym}]
                        - Price: ${quote.price}
                        - Change: ${quote.change} (${quote.changePercent}%)
                        - Day Range: ${quote.dayLow} - ${quote.dayHigh}
                        - Market Cap: ${quote.marketCap}
                        - Exchange: ${quote.exchange}
                        [HISTORICAL CONTEXT (1 Month)]
                        ${trendInfo}
                        `;
                    } catch (e) {
                        console.error(`Failed to fetch context for ${sym}`, e);
                        return null;
                    }
                }));

                const validContexts = stockContexts.filter(Boolean);
                if (validContexts.length > 0) {
                    contextData = `
                    \n\n=== SYSTEM INJECTED LIVE MARKET DATA ===
                    ${validContexts.join('\n')}
                    ========================================
                    Use this data to answer the user accurately.
                    `;
                }
            }
        }

        const systemPrompt = `You are a Stock Market Expert and Financial Assistant.

        CORE RESPONSIBILITIES:
        1. Answer questions about stocks using the PROVIDED REAL-TIME & HISTORICAL DATE.
        2. Provide Outlooks, Recommendations, and Risk Assessments based on this data.

        MANDATORY RULES (STRICT ENFORCEMENT):
        - **DISCLAIMER**: You MUST include a clear "Not financial advice" disclaimer in EVERY response related to stocks or finance.
        - **OUTLOOKS**: When asked for a price prediction or outlook, YOU MUST PROVIDE A PRICE RANGE (e.g., "$100 - $110"). NEVER predict an exact specific number. Label it as "Speculative Outlook".
        - **RECOMMENDATIONS**: If recommending to buy/watch, you MUST provide detailed REASONING based on the technicals/fundamentals provided.
        - **RISK ASSESSMENT**: You MUST classify the stock as Low, Medium, or High Risk and explain WHY (e.g., "High risk due to high volatility of X%").
        - **PRIVACY**: If the user asks about non-finance topics (cooking, politics, etc.), politely decline and say you only discuss the stock market.
        
        DATA USAGE:
        - If "SYSTEM INJECTED LIVE MARKET DATA" is present in the context, USE IT as the absolute truth.
        - If no data is present but the user asks for a price, try to give a general answer or ask them to specify the ticker symbol clearly (e.g., "AAPL").
        `;

        const postData = JSON.stringify({
            model: model || 'tngtech/deepseek-r1t2-chimera:free',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt + contextData,
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
