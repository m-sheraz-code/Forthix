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

        const apiKey = process.env.OPENROUTER_KEY;
    
        if (!apiKey) {
            console.error('CRITICAL: No OpenRouter API Key found in environment variables');
            return errorResponse(res, 401, 'OpenRouter API key is not configured.');
        }

        console.log('Using API Key:', apiKey.substring(0, 8) + '...');

        // --- STOCK DATA INJECTION ---
        let contextData = "";
        
        // 1. Extract potential symbols from the last user message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
            const content = lastMessage.content || "";
            // Dictionary for common company names to tickers
            const COMPANY_MAPPING: Record<string, string> = {
                'nvidia': 'NVDA', 'apple': 'AAPL', 'tesla': 'TSLA', 'microsoft': 'MSFT',
                'google': 'GOOGL', 'alphabet': 'GOOGL', 'amazon': 'AMZN', 'meta': 'META',
                'facebook': 'META', 'netflix': 'NFLX', 'amd': 'AMD', 'intel': 'INTC',
                'tsmc': 'TSM', 'broadcom': 'AVGO', 'oracle': 'ORCL', 'adobe': 'ADBE',
                'salesforce': 'CRM', 'uber': 'UBER', 'airbnb': 'ABNB', 'disney': 'DIS',
                'cocacola': 'KO', 'pepsi': 'PEP', 'mcdonalds': 'MCD', 'starbucks': 'SBUX',
                'nike': 'NKE', 'walmart': 'WMT', 'costco': 'COST', 'pfizer': 'PFE',
                'moderna': 'MRNA', 'jpmorgan': 'JPM', 'visa': 'V', 'mastercard': 'MA',
                'paypal': 'PYPL', 'bitcoin': 'BTC-USD', 'ethereum': 'ETH-USD',
                'sp500': '^GSPC', 'nasdaq': '^IXIC', 'dow': '^DJI'
            };

            const matches: string[] = [];
            
            // 1. Direct Regex for Tickers ($NVDA, NVDA)
            const tickerRegex = /(\$[A-Za-z]{2,5})|\b([A-Z]{2,5})\b/g;
            let match;
            while ((match = tickerRegex.exec(content)) !== null) {
                let clean = (match[1] || match[2]).replace('$', '').toUpperCase();
                matches.push(clean);
            }

            // 2. Keyword Search for Company Names
            const lowerContent = content.toLowerCase();
            Object.keys(COMPANY_MAPPING).forEach(name => {
                if (lowerContent.includes(name)) { // Simple include check, could be better with regex
                    matches.push(COMPANY_MAPPING[name]);
                }
            });
            
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
        - **NO HALLUCINATIONS**: If "SYSTEM INJECTED LIVE MARKET DATA" is NOT present for a requested stock, DO NOT MAKE UP NUMBERS. Instead, say: "I need to fetch the latest data. Please specify the stock symbol (e.g., $NVDA) or full company name."
        
        DATA USAGE:
        - If "SYSTEM INJECTED LIVE MARKET DATA" is present in the context, USE IT as the absolute truth.
        - If no data is present, do NOT invent data.
        `;

        const postData = JSON.stringify({
            model: model || 'z-ai/glm-4.5-air:free',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt + contextData,
                },
                ...messages,
            ],
        });
        
        console.log('Sending request to OpenRouter with model:', model || 'z-ai/glm-4.5-air:free');
        console.log('Request payload length:', postData.length);

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
            console.error('OpenRouter Error Response Body:', responseData.body);
            
            try {
                const errorJson = JSON.parse(responseData.body);
                // Pass through the exact error message from OpenRouter if possible
                const errorMessage = errorJson.error?.message || 'Error from OpenRouter';
                console.error('Parsed OpenRouter Error Message:', errorMessage);
                return errorResponse(res, responseData.statusCode, errorMessage);
            } catch (p) {
                console.error('Failed to parse error body JSON');
                return errorResponse(res, responseData.statusCode, `Raw Error: ${responseData.body.substring(0, 200)}`);
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
