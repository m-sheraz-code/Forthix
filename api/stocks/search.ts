import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchSymbols } from '../lib/yahoo-finance.js';
import { handleOptions, setCorsHeaders, errorResponse } from '../lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    try {
        const { q, query } = req.query;
        const searchQuery = (q || query) as string;

        if (!searchQuery || searchQuery.length < 1) {
            return errorResponse(res, 400, 'Search query is required (min 1 character)');
        }

        const results = await searchSymbols(searchQuery);

        // Set cache headers (search results can be cached longer)
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

        return res.status(200).json({
            query: searchQuery,
            results,
            count: results.length,
        });
    } catch (error) {
        console.error('Stock search error:', error);
        return errorResponse(res, 500, 'Failed to search stocks');
    }
}
