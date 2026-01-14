import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCorsHeaders, errorResponse } from '../_lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { username, password } = req.body;
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminUser || !adminPass) {
            console.error('Admin config missing:', { hasUser: !!adminUser, hasPass: !!adminPass });
            return errorResponse(res, 500, 'Admin credentials not configured');
        }

        if (username === adminUser && password === adminPass) {
            // For a simple standalone login, we can just return success.
            // In a real app, we'd return a session token or JWT.
            // But for this request, a simple verification is enough.
            return res.status(200).json({
                success: true,
                message: 'Login successful'
            });
        }

        return errorResponse(res, 401, 'Invalid credentials');
    } catch (error: any) {
        console.error('Login error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
