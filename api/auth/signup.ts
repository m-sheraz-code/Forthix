import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import {
    handleOptions,
    errorResponse,
    validateRequired,
    validateEmail,
    validatePassword,
    setCorsHeaders,
} from '../lib/middleware';

interface SignupBody {
    email: string;
    password: string;
    username?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { email, password, username } = req.body as SignupBody;

        // Validation
        const emailError = validateRequired(email, 'Email') || validateEmail(email);
        if (emailError) {
            return errorResponse(res, 400, emailError);
        }

        const passwordError = validateRequired(password, 'Password') || validatePassword(password);
        if (passwordError) {
            return errorResponse(res, 400, passwordError);
        }

        // Create user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || email.split('@')[0],
                },
            },
        });

        if (error) {
            console.error('Signup error:', error);
            return errorResponse(res, 400, error.message);
        }

        if (!data.user) {
            return errorResponse(res, 400, 'Failed to create user');
        }

        // Return success with user data (session is auto-created by trigger)
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at,
            },
            session: data.session ? {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            } : null,
        });
    } catch (error) {
        console.error('Signup handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
