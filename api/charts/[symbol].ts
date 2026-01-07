import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getChartData } from '../lib/yahoo-finance';
import { handleOptions, setCorsHeaders, errorResponse, validateSymbol } from '../lib/middleware';

const VALID_RANGES = ['1d', '5d', '1m', '6m', 'ytd', '1y', '5y', 'max'];

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

        // Validate range
        if (!VALID_RANGES.includes(rangeStr)) {
            return errorResponse(
                res,
                400,
                `Invalid range. Valid options: ${VALID_RANGES.join(', ')}`
            );
        }

        const chartData = await getChartData(symbolStr, rangeStr);

        if (chartData.length === 0) {
            return errorResponse(res, 404, `No chart data found for ${symbolStr}`);
        }

        // Calculate some basic stats
        const prices = chartData.map((d) => d.close);
        const high = Math.max(...chartData.map((d) => d.high));
        const low = Math.min(...chartData.map((d) => d.low));
        const open = chartData[0].open;
        const close = chartData[chartData.length - 1].close;
        const change = close - open;
        const changePercent = (change / open) * 100;

        // Set cache headers based on range
        const cacheTime = rangeStr === '1d' ? 60 : 300;
        res.setHeader('Cache-Control', `s-maxage=${cacheTime}, stale-while-revalidate=60`);

        return res.status(200).json({
            symbol: symbolStr,
            range: rangeStr,
            data: chartData,
            stats: {
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                open: Number(open.toFixed(2)),
                close: Number(close.toFixed(2)),
                change: Number(change.toFixed(2)),
                changePercent: Number(changePercent.toFixed(2)),
                dataPoints: chartData.length,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Chart data error:', error);
        return errorResponse(res, 500, 'Failed to fetch chart data');
    }
}
