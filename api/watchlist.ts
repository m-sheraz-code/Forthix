import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from './lib/supabase.js';
import { getQuotes } from './lib/yahoo-finance.js';
import {
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateRequired,
    validateUUID,
} from './lib/middleware.js';

interface AuthenticatedRequest extends VercelRequest {
    user?: {
        id: string;
        email: string;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

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
    const { id } = req.query;

    // Route based on presence of ID
    if (id) {
        // Single watchlist operations
        const idError = validateUUID(id);
        if (idError) {
            return errorResponse(res, 400, idError);
        }

        const watchlistId = id as string;

        switch (req.method) {
            case 'GET':
                return getWatchlist(supabase, res, watchlistId, userId);
            case 'PUT':
                return updateWatchlist(req, supabase, res, watchlistId, userId);
            case 'DELETE':
                return deleteWatchlist(supabase, res, watchlistId, userId);
            default:
                return errorResponse(res, 405, 'Method not allowed');
        }
    } else {
        // Watchlist list operations
        switch (req.method) {
            case 'GET':
                return getWatchlists(req, supabase, res, userId);
            case 'POST':
                return createWatchlist(req, supabase, res, userId);
            default:
                return errorResponse(res, 405, 'Method not allowed');
        }
    }
}

// Get all watchlists
async function getWatchlists(req: VercelRequest, supabase: any, res: VercelResponse, userId: string) {
    try {
        const { data: watchlists, error } = await supabase
            .from('watchlists')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get watchlists error:', error);
            return errorResponse(res, 500, 'Failed to fetch watchlists');
        }

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

// Create watchlist
async function createWatchlist(req: VercelRequest, supabase: any, res: VercelResponse, userId: string) {
    try {
        const { name, symbols = [] } = req.body;

        const nameError = validateRequired(name, 'Watchlist name');
        if (nameError) {
            return errorResponse(res, 400, nameError);
        }

        if (!Array.isArray(symbols)) {
            return errorResponse(res, 400, 'Symbols must be an array');
        }

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

// Get single watchlist
async function getWatchlist(supabase: any, res: VercelResponse, watchlistId: string, userId: string) {
    try {
        const { data: watchlist, error } = await supabase
            .from('watchlists')
            .select('*')
            .eq('id', watchlistId)
            .eq('user_id', userId)
            .single();

        if (error || !watchlist) {
            return errorResponse(res, 404, 'Watchlist not found');
        }

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

// Update watchlist
async function updateWatchlist(
    req: VercelRequest,
    supabase: any,
    res: VercelResponse,
    watchlistId: string,
    userId: string
) {
    try {
        const { name, symbols } = req.body;
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

// Delete watchlist
async function deleteWatchlist(supabase: any, res: VercelResponse, watchlistId: string, userId: string) {
    try {
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
