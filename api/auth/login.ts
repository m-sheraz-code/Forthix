import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import {
    handleOptions,
    errorResponse,
    validateRequired,
    validateEmail,
    setCorsHeaders,
} from '../lib/middleware';

interface LoginBody {
    email: string;
    password: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { email, password } = req.body as LoginBody;

        // Validation
        const emailError = validateRequired(email, 'Email') || validateEmail(email);
        if (emailError) {
            return errorResponse(res, 400, emailError);
        }

        const passwordError = validateRequired(password, 'Password');
        if (passwordError) {
            return errorResponse(res, 400, passwordError);
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            // Don't reveal if email exists or not for security
            return errorResponse(res, 401, 'Invalid email or password');
        }

        if (!data.user || !data.session) {
            return errorResponse(res, 401, 'Invalid email or password');
        }

        // Return user and session data
        return res.status(200).json({
            user: {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                expires_in: data.session.expires_in,
            },
        });
    } catch (error) {
        console.error('Login handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
