import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from './_lib/supabase.js';
import { getChartData } from './_lib/yahoo-finance.js';
import {
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateSymbol,
    validateRequired,
} from './_lib/middleware.js';

const VALID_RANGES = ['1d', '5d', '1m', '3m', '6m', 'ytd', '1y', '5y', 'all', 'max'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const { saved, symbol } = req.query;

    // Route to saved charts if saved=true
    if (saved === 'true') {
        return handleSavedCharts(req, res);
    }

    // Route to symbol chart data
    if (symbol) {
        return handleSymbolChart(req, res);
    }

    return errorResponse(res, 400, 'Either symbol or saved=true query parameter is required');
}

// Handle symbol chart data
async function handleSymbolChart(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { symbol, range = '1d' } = req.query;

        // Validate symbol
        const symbolError = validateSymbol(symbol);
        if (symbolError) {
            return errorResponse(res, 400, symbolError);
        }

        const symbolStr = (symbol as string).toUpperCase();
        const rangeStr = (range as string) || '1d';

        // Validate range
        if (!VALID_RANGES.includes(rangeStr)) {
            return errorResponse(res, 400, `Invalid range. Valid options: ${VALID_RANGES.join(', ')}`);
        }

        const chartData = await getChartData(symbolStr, rangeStr);

        if (chartData.length === 0) {
            return errorResponse(res, 404, `No chart data found for ${symbolStr}`);
        }

        // Calculate stats
        const high = Math.max(...chartData.map((d) => d.high));
        const low = Math.min(...chartData.map((d) => d.low));
        const open = chartData[0].open;
        const close = chartData[chartData.length - 1].close;
        const change = close - open;
        const changePercent = (change / open) * 100;

        // Set cache headers
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

// Handle saved charts
async function handleSavedCharts(req: VercelRequest, res: VercelResponse) {
    // Require authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 401, 'Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createAuthenticatedClient(token);

    // Get user from token
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return errorResponse(res, 401, 'Invalid or expired token');
    }

    const userId = user.id;

    if (req.method === 'GET') {
        return getSavedCharts(supabase, res, userId);
    } else if (req.method === 'POST') {
        return saveChart(req, supabase, res, userId);
    } else {
        return errorResponse(res, 405, 'Method not allowed');
    }
}

// Get saved charts
async function getSavedCharts(supabase: any, res: VercelResponse, userId: string) {
    try {
        const { data: charts, error } = await supabase
            .from('saved_charts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get saved charts error:', error);
            return errorResponse(res, 500, 'Failed to fetch saved charts');
        }

        return res.status(200).json({ charts: charts || [] });
    } catch (error) {
        console.error('Get saved charts error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

// Save chart
async function saveChart(req: VercelRequest, supabase: any, res: VercelResponse, userId: string) {
    try {
        const { symbol, name, config } = req.body;

        // Validation
        const symbolError = validateRequired(symbol, 'Symbol');
        if (symbolError) {
            return errorResponse(res, 400, symbolError);
        }

        const { data: chart, error } = await supabase
            .from('saved_charts')
            .insert({
                user_id: userId,
                symbol: symbol.toUpperCase(),
                name: name || `${symbol} Chart`,
                config: config || {},
            })
            .select()
            .single();

        if (error) {
            console.error('Save chart error:', error);
            return errorResponse(res, 500, 'Failed to save chart');
        }

        return res.status(201).json({ chart });
    } catch (error) {
        console.error('Save chart error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
