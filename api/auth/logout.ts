import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import {
    handleOptions,
    errorResponse,
    setCorsHeaders,
} from '../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Not logged in, just return success
            return res.status(200).json({ message: 'Logged out successfully' });
        }

        // Sign out with Supabase (invalidates token on server)
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            // Even if server-side logout fails, client should clear tokens
            return res.status(200).json({
                message: 'Logged out successfully',
                warning: 'Server session invalidation may have failed'
            });
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
