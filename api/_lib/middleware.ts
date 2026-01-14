/**
 * Authentication middleware for Vercel serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthToken } from './supabase.js';

export interface AuthenticatedRequest extends VercelRequest {
    user?: {
        id: string;
        email: string;
    };
}

export type AuthenticatedHandler = (
    req: AuthenticatedRequest,
    res: VercelResponse
) => Promise<VercelResponse | void> | VercelResponse | void;

/**
 * Middleware to require authentication
 * Extracts and verifies JWT from Authorization header
 */
export function withAuth(handler: AuthenticatedHandler) {
    return async (req: VercelRequest, res: VercelResponse) => {
        const authHeader = req.headers.authorization;

        const authResult = await verifyAuthToken(authHeader);

        if (!authResult) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Valid authentication token required',
            });
        }

        // Attach user to request
        (req as AuthenticatedRequest).user = authResult.user;

        return handler(req as AuthenticatedRequest, res);
    };
}

/**
 * Middleware for optional authentication
 * Attaches user if valid token present, continues without if not
 */
export function withOptionalAuth(handler: AuthenticatedHandler) {
    return async (req: VercelRequest, res: VercelResponse) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const authResult = await verifyAuthToken(authHeader);
            if (authResult) {
                (req as AuthenticatedRequest).user = authResult.user;
            }
        }

        return handler(req as AuthenticatedRequest, res);
    };
}

/**
 * Standard error response helper
 */
export function errorResponse(
    res: VercelResponse,
    status: number,
    message: string,
    details?: unknown
) {
    return res.status(status).json({
        error: message,
        ...(details !== undefined ? { details } : {}),
    });
}

/**
 * Input validation helpers
 */
export function validateRequired(
    value: unknown,
    fieldName: string
): string | null {
    if (value === undefined || value === null || value === '') {
        return `${fieldName} is required`;
    }
    return null;
}

export function validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    return null;
}

export function validatePassword(password: string): string | null {
    if (password.length < 6) {
        return 'Password must be at least 6 characters';
    }
    return null;
}

export function validateSymbol(symbol: unknown): string | null {
    if (!symbol || typeof symbol !== 'string') {
        return 'Symbol is required';
    }
    if (!/^[A-Za-z0-9.\-^]+$/.test(symbol)) {
        return 'Invalid symbol format';
    }
    return null;
}

export function validateUUID(id: unknown): string | null {
    if (!id || typeof id !== 'string') {
        return 'ID is required';
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return 'Invalid ID format';
    }
    return null;
}

/**
 * CORS headers helper for preflight requests
 */
export function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.status(200).end();
        return true;
    }
    return false;
}
