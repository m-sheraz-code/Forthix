import type { VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from '../lib/supabase.js';
import {
    withAuth,
    AuthenticatedRequest,
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateRequired,
} from '../lib/middleware.js';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const userId = req.user!.id;
    const token = req.headers.authorization!.replace('Bearer ', '');

    if (req.method === 'GET') {
        return getPreferences(token, res, userId);
    } else if (req.method === 'PUT') {
        return updatePreferences(req, res, token, userId);
    } else {
        return errorResponse(res, 405, 'Method not allowed');
    }
}

async function getPreferences(
    token: string,
    res: VercelResponse,
    userId: string
) {
    try {
        const supabase = createAuthenticatedClient(token);

        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If no preferences exist, return defaults
            if (error.code === 'PGRST116') {
                return res.status(200).json({
                    preferences: {
                        theme: 'dark',
                        default_chart_type: 'line',
                        default_timeframe: '1d',
                        notifications_enabled: true,
                        email_alerts: false,
                        watchlist_alerts: true,
                    },
                });
            }
            console.error('Get preferences error:', error);
            return errorResponse(res, 500, 'Failed to fetch preferences');
        }

        return res.status(200).json({ preferences });
    } catch (error) {
        console.error('Get preferences error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function updatePreferences(
    req: AuthenticatedRequest,
    res: VercelResponse,
    token: string,
    userId: string
) {
    try {
        const {
            theme,
            default_chart_type,
            default_timeframe,
            notifications_enabled,
            email_alerts,
            watchlist_alerts,
        } = req.body;

        const supabase = createAuthenticatedClient(token);

        // Build update object with only provided fields
        const updates: Record<string, unknown> = {};

        if (theme !== undefined) {
            if (!['light', 'dark'].includes(theme)) {
                return errorResponse(res, 400, 'Theme must be "light" or "dark"');
            }
            updates.theme = theme;
        }

        if (default_chart_type !== undefined) {
            if (!['line', 'candlestick', 'area'].includes(default_chart_type)) {
                return errorResponse(res, 400, 'Invalid chart type');
            }
            updates.default_chart_type = default_chart_type;
        }

        if (default_timeframe !== undefined) {
            updates.default_timeframe = default_timeframe;
        }

        if (notifications_enabled !== undefined) {
            updates.notifications_enabled = Boolean(notifications_enabled);
        }

        if (email_alerts !== undefined) {
            updates.email_alerts = Boolean(email_alerts);
        }

        if (watchlist_alerts !== undefined) {
            updates.watchlist_alerts = Boolean(watchlist_alerts);
        }

        if (Object.keys(updates).length === 0) {
            return errorResponse(res, 400, 'No valid fields to update');
        }

        // Use upsert to create if doesn't exist
        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                ...updates,
            })
            .select()
            .single();

        if (error) {
            console.error('Update preferences error:', error);
            return errorResponse(res, 500, 'Failed to update preferences');
        }

        return res.status(200).json({ preferences });
    } catch (error) {
        console.error('Update preferences error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

export default withAuth(handler);
