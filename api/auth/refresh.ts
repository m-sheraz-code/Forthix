import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import {
    handleOptions,
    errorResponse,
    validateRequired,
    setCorsHeaders,
} from '../lib/middleware';

interface RefreshBody {
    refresh_token: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { refresh_token } = req.body as RefreshBody;

        const tokenError = validateRequired(refresh_token, 'Refresh token');
        if (tokenError) {
            return errorResponse(res, 400, tokenError);
        }

        // Refresh the session
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token,
        });

        if (error || !data.session) {
            return errorResponse(res, 401, 'Invalid or expired refresh token');
        }

        return res.status(200).json({
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                expires_in: data.session.expires_in,
            },
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
            } : null,
        });
    } catch (error) {
        console.error('Refresh handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
