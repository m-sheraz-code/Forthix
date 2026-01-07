import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAuthenticatedClient } from '../lib/supabase';
import {
    handleOptions,
    errorResponse,
    setCorsHeaders,
} from '../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'Authentication required');
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createAuthenticatedClient(token);

        // Get user from token
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return errorResponse(res, 401, 'Invalid or expired token');
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url, bio')
            .eq('id', user.id)
            .single();

        // Fetch user preferences
        const { data: preferences, error: prefError } = await supabase
            .from('user_preferences')
            .select('theme, default_chart_type, notifications_enabled')
            .eq('user_id', user.id)
            .single();

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                profile: profile || null,
                preferences: preferences || null,
            },
        });
    } catch (error) {
        console.error('Me handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
