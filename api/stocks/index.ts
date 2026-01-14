import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getQuote, getChartData } from '../_lib/yahoo-finance.js';
import { handleOptions, setCorsHeaders, errorResponse, validateSymbol } from '../_lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { symbol } = req.query;
        const { range = '1d' } = req.query;

        // Validate symbol
        const symbolError = validateSymbol(symbol);
        if (symbolError) {
            return errorResponse(res, 400, symbolError);
        }

        const symbolStr = (symbol as string).toUpperCase();
        const rangeStr = (range as string) || '1d';

        // Fetch quote and chart data in parallel
        const [quote, chartData] = await Promise.all([
            getQuote(symbolStr),
            getChartData(symbolStr, rangeStr),
        ]);

        if (!quote) {
            return errorResponse(res, 404, `Stock ${symbolStr} not found`);
        }

        // Build response
        const response = {
            symbol: quote.symbol,
            name: quote.name,
            exchange: quote.exchange || 'Unknown',
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            open: quote.open,
            previousClose: quote.previousClose,
            dayHigh: quote.dayHigh,
            dayLow: quote.dayLow,
            volume: quote.volume,
            marketCap: quote.marketCap,
            chartData: chartData.map((d) => ({
                time: d.time,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
                volume: d.volume,
            })),
            timestamp: new Date().toISOString(),
        };

        // Set cache headers
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

        return res.status(200).json(response);
    } catch (error) {
        console.error('Stock detail error:', error);
        return errorResponse(res, 500, 'Failed to fetch stock data');
    }
}
