import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, createAuthenticatedClient } from '../lib/supabase.js';
import {
    handleOptions,
    errorResponse,
    validateRequired,
    validateEmail,
    validatePassword,
    setCorsHeaders,
} from '../lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const { action } = req.query;

    switch (action) {
        case 'login':
            return handleLogin(req, res);
        case 'signup':
            return handleSignup(req, res);
        case 'logout':
            return handleLogout(req, res);
        case 'me':
            return handleMe(req, res);
        case 'refresh':
            return handleRefresh(req, res);
        default:
            return errorResponse(res, 400, 'Invalid action. Use: login, signup, logout, me, or refresh');
    }
}

// Login handler
async function handleLogin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { email, password } = req.body as { email: string; password: string };

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
            return errorResponse(res, 401, 'Invalid email or password');
        }

        if (!data.user || !data.session) {
            return errorResponse(res, 401, 'Invalid email or password');
        }

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

// Signup handler
async function handleSignup(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { email, password, username } = req.body as {
            email: string;
            password: string;
            username?: string;
        };

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

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at,
            },
            session: data.session
                ? {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                }
                : null,
        });
    } catch (error) {
        console.error('Signup handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

// Logout handler
async function handleLogout(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(200).json({ message: 'Logged out successfully' });
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            return res.status(200).json({
                message: 'Logged out successfully',
                warning: 'Server session invalidation may have failed',
            });
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

// Me handler
async function handleMe(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'Authentication required');
        }

        const token = authHeader.replace('Bearer ', '');
        const supabaseClient = createAuthenticatedClient(token);

        const {
            data: { user },
            error,
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            return errorResponse(res, 401, 'Invalid or expired token');
        }

        // Fetch user profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('username, display_name, avatar_url, bio')
            .eq('id', user.id)
            .single();

        // Fetch user preferences
        const { data: preferences } = await supabaseClient
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

// Refresh handler
async function handleRefresh(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { refresh_token } = req.body as { refresh_token: string };

        const tokenError = validateRequired(refresh_token, 'Refresh token');
        if (tokenError) {
            return errorResponse(res, 400, tokenError);
        }

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
            user: data.user
                ? {
                    id: data.user.id,
                    email: data.user.email,
                }
                : null,
        });
    } catch (error) {
        console.error('Refresh handler error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}
