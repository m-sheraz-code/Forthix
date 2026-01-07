import type { VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from '../lib/supabase';
import { getQuotes } from '../lib/yahoo-finance';
import {
    withAuth,
    AuthenticatedRequest,
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateUUID,
    validateRequired,
} from '../lib/middleware';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const { id } = req.query;
    const idError = validateUUID(id);
    if (idError) {
        return errorResponse(res, 400, idError);
    }

    const watchlistId = id as string;
    const userId = req.user!.id;
    const token = req.headers.authorization!.replace('Bearer ', '');

    switch (req.method) {
        case 'GET':
            return getWatchlist(token, res, watchlistId, userId);
        case 'PUT':
            return updateWatchlist(req, res, token, watchlistId, userId);
        case 'DELETE':
            return deleteWatchlist(token, res, watchlistId, userId);
        default:
            return errorResponse(res, 405, 'Method not allowed');
    }
}

async function getWatchlist(
    token: string,
    res: VercelResponse,
    watchlistId: string,
    userId: string
) {
    try {
        const supabase = createAuthenticatedClient(token);

        const { data: watchlist, error } = await supabase
            .from('watchlists')
            .select('*')
            .eq('id', watchlistId)
            .eq('user_id', userId)
            .single();

        if (error || !watchlist) {
            return errorResponse(res, 404, 'Watchlist not found');
        }

        // Fetch current prices for symbols
        let quotes: any[] = [];
        if (watchlist.symbols && watchlist.symbols.length > 0) {
            quotes = await getQuotes(watchlist.symbols);
        }

        return res.status(200).json({
            watchlist: {
                ...watchlist,
                quotes,
            },
        });
    } catch (error) {
        console.error('Get watchlist error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function updateWatchlist(
    req: AuthenticatedRequest,
    res: VercelResponse,
    token: string,
    watchlistId: string,
    userId: string
) {
    try {
        const { name, symbols } = req.body;
        const supabase = createAuthenticatedClient(token);

        // Build update object
        const updates: Record<string, unknown> = {};

        if (name !== undefined) {
            const nameError = validateRequired(name, 'Watchlist name');
            if (nameError) {
                return errorResponse(res, 400, nameError);
            }
            updates.name = name;
        }

        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                return errorResponse(res, 400, 'Symbols must be an array');
            }
            updates.symbols = symbols.map((s: string) => s.toUpperCase());
        }

        if (Object.keys(updates).length === 0) {
            return errorResponse(res, 400, 'No valid fields to update');
        }

        const { data: watchlist, error } = await supabase
            .from('watchlists')
            .update(updates)
            .eq('id', watchlistId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update watchlist error:', error);
            return errorResponse(res, 500, 'Failed to update watchlist');
        }

        if (!watchlist) {
            return errorResponse(res, 404, 'Watchlist not found');
        }

        return res.status(200).json({ watchlist });
    } catch (error) {
        console.error('Update watchlist error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function deleteWatchlist(
    token: string,
    res: VercelResponse,
    watchlistId: string,
    userId: string
) {
    try {
        const supabase = createAuthenticatedClient(token);

        const { error } = await supabase
            .from('watchlists')
            .delete()
            .eq('id', watchlistId)
            .eq('user_id', userId);

        if (error) {
            console.error('Delete watchlist error:', error);
            return errorResponse(res, 500, 'Failed to delete watchlist');
        }

        return res.status(200).json({ message: 'Watchlist deleted successfully' });
    } catch (error) {
        console.error('Delete watchlist error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

export default withAuth(handler);
