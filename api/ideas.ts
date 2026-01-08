import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, createAuthenticatedClient } from './lib/supabase.js';
import {
  withOptionalAuth,
  AuthenticatedRequest,
  handleOptions,
  setCorsHeaders,
  errorResponse,
  validateRequired,
} from './lib/middleware.js';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method === 'GET') {
    return getIdeas(req, res);
  } else if (req.method === 'POST') {
    return createIdea(req, res);
  } else {
    return errorResponse(res, 405, 'Method not allowed');
  }
}

async function getIdeas(req: AuthenticatedRequest, res: VercelResponse) {
  try {
    const { filter = 'latest', symbol, limit = '20', offset = '0' } = req.query;

    let query = supabase
      .from('ideas')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .limit(parseInt(limit as string, 10))
      .range(
        parseInt(offset as string, 10),
        parseInt(offset as string, 10) + parseInt(limit as string, 10) - 1
      );

    // Filter by symbol if provided
    if (symbol) {
      query = query.eq('symbol', (symbol as string).toUpperCase());
    }

    // Apply sorting based on filter
    switch (filter) {
      case 'popular':
        query = query.order('likes', { ascending: false });
        break;
      case 'editors':
        // For now, same as popular - can add editors_pick column later
        query = query.order('likes', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Get ideas error:', error);
      return errorResponse(res, 500, 'Failed to fetch ideas');
    }

    // Transform the response
    const transformedIdeas = (ideas || []).map((idea: any) => ({
      id: idea.id,
      title: idea.title,
      content: idea.content,
      symbol: idea.symbol,
      image: idea.image_url,
      likes: idea.likes,
      author: idea.profiles?.display_name || idea.profiles?.username || 'Anonymous',
      authorAvatar: idea.profiles?.avatar_url,
      time: formatTimeAgo(idea.created_at),
      created_at: idea.created_at,
    }));

    // Set cache headers for public data
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    return res.status(200).json({
      ideas: transformedIdeas,
      filter,
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
}

async function createIdea(req: AuthenticatedRequest, res: VercelResponse) {
  // Require authentication for creating ideas
  if (!req.user) {
    return errorResponse(res, 401, 'Authentication required');
  }

  try {
    const { title, content, symbol, image_url } = req.body;

    // Validation
    const titleError = validateRequired(title, 'Title');
    if (titleError) {
      return errorResponse(res, 400, titleError);
    }

    const token = req.headers.authorization!.replace('Bearer ', '');
    const authSupabase = createAuthenticatedClient(token);

    const { data: idea, error } = await authSupabase
      .from('ideas')
      .insert({
        user_id: req.user.id,
        title,
        content: content || null,
        symbol: symbol ? symbol.toUpperCase() : null,
        image_url: image_url || null,
      })
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Create idea error:', error);
      return errorResponse(res, 500, 'Failed to create idea');
    }

    return res.status(201).json({
      idea: {
        id: idea.id,
        title: idea.title,
        content: idea.content,
        symbol: idea.symbol,
        image: idea.image_url,
        likes: idea.likes,
        author: idea.profiles?.display_name || idea.profiles?.username || 'Anonymous',
        created_at: idea.created_at,
      },
    });
  } catch (error) {
    console.error('Create idea error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
}

export default withOptionalAuth(handler);
