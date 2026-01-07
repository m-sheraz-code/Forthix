import type { VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from '../../lib/supabase';
import {
    withAuth,
    AuthenticatedRequest,
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateRequired,
} from '../../lib/middleware';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const userId = req.user!.id;
    const token = req.headers.authorization!.replace('Bearer ', '');

    if (req.method === 'GET') {
        return getSavedCharts(token, res, userId);
    } else if (req.method === 'POST') {
        return saveChart(req, res, token, userId);
    } else {
        return errorResponse(res, 405, 'Method not allowed');
    }
}

async function getSavedCharts(
    token: string,
    res: VercelResponse,
    userId: string
) {
    try {
        const supabase = createAuthenticatedClient(token);

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

async function saveChart(
    req: AuthenticatedRequest,
    res: VercelResponse,
    token: string,
    userId: string
) {
    try {
        const { symbol, name, config } = req.body;

        // Validation
        const symbolError = validateRequired(symbol, 'Symbol');
        if (symbolError) {
            return errorResponse(res, 400, symbolError);
        }

        const supabase = createAuthenticatedClient(token);

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

export default withAuth(handler);
