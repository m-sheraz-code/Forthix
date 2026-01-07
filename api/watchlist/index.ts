import type { VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from '../lib/supabase';
import { getQuotes } from '../lib/yahoo-finance';
import {
    withAuth,
    AuthenticatedRequest,
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateRequired,
} from '../lib/middleware';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const userId = req.user!.id;

    if (req.method === 'GET') {
        return getWatchlists(req, res, userId);
    } else if (req.method === 'POST') {
        return createWatchlist(req, res, userId);
    } else {
        return errorResponse(res, 405, 'Method not allowed');
    }
}

async function getWatchlists(
    req: AuthenticatedRequest,
    res: VercelResponse,
    userId: string
) {
    try {
        const token = req.headers.authorization!.replace('Bearer ', '');
        const supabase = createAuthenticatedClient(token);

        const { data: watchlists, error } = await supabase
            .from('watchlists')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get watchlists error:', error);
            return errorResponse(res, 500, 'Failed to fetch watchlists');
        }

        // Optionally fetch current prices for symbols in watchlists
        const { withPrices } = req.query;

        if (withPrices === 'true') {
            const watchlistsWithPrices = await Promise.all(
                (watchlists || []).map(async (watchlist) => {
                    if (watchlist.symbols && watchlist.symbols.length > 0) {
                        const quotes = await getQuotes(watchlist.symbols);
                        return {
                            ...watchlist,
                            quotes,
                        };
                    }
                    return watchlist;
                })
            );

            return res.status(200).json({ watchlists: watchlistsWithPrices });
        }

        return res.status(200).json({ watchlists: watchlists || [] });
    } catch (error) {
        console.error('Get watchlists error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function createWatchlist(
    req: AuthenticatedRequest,
    res: VercelResponse,
    userId: string
) {
    try {
        const { name, symbols = [] } = req.body;

        // Validation
        const nameError = validateRequired(name, 'Watchlist name');
        if (nameError) {
            return errorResponse(res, 400, nameError);
        }

        if (!Array.isArray(symbols)) {
            return errorResponse(res, 400, 'Symbols must be an array');
        }

        const token = req.headers.authorization!.replace('Bearer ', '');
        const supabase = createAuthenticatedClient(token);

        const { data: watchlist, error } = await supabase
            .from('watchlists')
            .insert({
                user_id: userId,
                name,
                symbols: symbols.map((s: string) => s.toUpperCase()),
            })
            .select()
            .single();

        if (error) {
            console.error('Create watchlist error:', error);
            return errorResponse(res, 500, 'Failed to create watchlist');
        }

        return res.status(201).json({ watchlist });
    } catch (error) {
        console.error('Create watchlist error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

export default withAuth(handler);
