import type { VercelResponse } from '@vercel/node';
import { supabase, createAuthenticatedClient } from '../lib/supabase.js';
import {
    withOptionalAuth,
    AuthenticatedRequest,
    handleOptions,
    setCorsHeaders,
    errorResponse,
    validateUUID,
} from '../lib/middleware.js';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    const { id } = req.query;
    const idError = validateUUID(id);
    if (idError) {
        return errorResponse(res, 400, idError);
    }

    const ideaId = id as string;

    switch (req.method) {
        case 'GET':
            return getIdea(res, ideaId);
        case 'PUT':
            return updateIdea(req, res, ideaId);
        case 'DELETE':
            return deleteIdea(req, res, ideaId);
        case 'POST':
            return handleIdeaAction(req, res, ideaId);
        default:
            return errorResponse(res, 405, 'Method not allowed');
    }
}

async function getIdea(res: VercelResponse, ideaId: string) {
    try {
        // Get idea with author info and comment count
        let { data: idea, error } = await supabase
            .from('ideas')
            .select(`
        *,
        profiles:user_id (username, display_name, avatar_url),
        idea_comments (count)
      `)
            .eq('id', ideaId)
            .single();

        // Fallback if the profile/comment join fails
        if (error && error.code === 'PGRST200') {
            console.warn('Relationships missing, falling back to simple select');
            const fallback = await supabase
                .from('ideas')
                .select('*')
                .eq('id', ideaId)
                .single();
            idea = fallback.data;
            error = fallback.error;
        }

        if (error || !idea) {
            return errorResponse(res, 404, 'Idea not found');
        }

        // Get comments
        const { data: comments } = await supabase
            .from('idea_comments')
            .select(`
        id,
        content,
        created_at,
        profiles:user_id (username, display_name, avatar_url)
      `)
            .eq('idea_id', ideaId)
            .order('created_at', { ascending: true });

        // Set cache headers
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

        return res.status(200).json({
            idea: {
                id: idea.id,
                title: idea.title,
                content: idea.content,
                symbol: idea.symbol,
                image: idea.image_url,
                likes: idea.likes,
                author: idea.user_id === null ? 'Forthix Editor' : (idea.profiles?.display_name || idea.profiles?.username || 'Anonymous'),
                authorAvatar: idea.profiles?.avatar_url,
                created_at: idea.created_at,
                comments: (comments || []).map((c: any) => ({
                    id: c.id,
                    content: c.content,
                    author: c.profiles?.display_name || c.profiles?.username || 'Anonymous',
                    authorAvatar: c.profiles?.avatar_url,
                    created_at: c.created_at,
                })),
                commentCount: idea.idea_comments?.[0]?.count || 0,
            },
        });
    } catch (error) {
        console.error('Get idea error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function updateIdea(
    req: AuthenticatedRequest,
    res: VercelResponse,
    ideaId: string
) {
    if (!req.user) {
        return errorResponse(res, 401, 'Authentication required');
    }

    try {
        const { title, content, symbol, image_url } = req.body;
        const token = req.headers.authorization!.replace('Bearer ', '');
        const authSupabase = createAuthenticatedClient(token);

        const updates: Record<string, unknown> = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (symbol !== undefined) updates.symbol = symbol?.toUpperCase() || null;
        if (image_url !== undefined) updates.image_url = image_url;

        if (Object.keys(updates).length === 0) {
            return errorResponse(res, 400, 'No valid fields to update');
        }

        const { data: idea, error } = await authSupabase
            .from('ideas')
            .update(updates)
            .eq('id', ideaId)
            .eq('user_id', req.user.id) // Ensure user owns the idea
            .select()
            .single();

        if (error || !idea) {
            return errorResponse(res, 404, 'Idea not found or not authorized');
        }

        return res.status(200).json({ idea });
    } catch (error) {
        console.error('Update idea error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function deleteIdea(
    req: AuthenticatedRequest,
    res: VercelResponse,
    ideaId: string
) {
    if (!req.user) {
        return errorResponse(res, 401, 'Authentication required');
    }

    try {
        const token = req.headers.authorization!.replace('Bearer ', '');
        const authSupabase = createAuthenticatedClient(token);

        const { error } = await authSupabase
            .from('ideas')
            .delete()
            .eq('id', ideaId)
            .eq('user_id', req.user.id);

        if (error) {
            console.error('Delete idea error:', error);
            return errorResponse(res, 500, 'Failed to delete idea');
        }

        return res.status(200).json({ message: 'Idea deleted successfully' });
    } catch (error) {
        console.error('Delete idea error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function handleIdeaAction(
    req: AuthenticatedRequest,
    res: VercelResponse,
    ideaId: string
) {
    if (!req.user) {
        return errorResponse(res, 401, 'Authentication required');
    }

    const { action, content } = req.body;

    switch (action) {
        case 'like':
            return likeIdea(req, res, ideaId);
        case 'unlike':
            return unlikeIdea(req, res, ideaId);
        case 'comment':
            return addComment(req, res, ideaId, content);
        default:
            return errorResponse(res, 400, 'Invalid action. Use like, unlike, or comment');
    }
}

async function likeIdea(
    req: AuthenticatedRequest,
    res: VercelResponse,
    ideaId: string
) {
    try {
        const token = req.headers.authorization!.replace('Bearer ', '');
        const authSupabase = createAuthenticatedClient(token);

        const { error } = await authSupabase
            .from('idea_likes')
            .insert({
                idea_id: ideaId,
                user_id: req.user!.id,
            });

        if (error) {
            if (error.code === '23505') {
                return errorResponse(res, 400, 'Already liked this idea');
            }
            console.error('Like idea error:', error);
            return errorResponse(res, 500, 'Failed to like idea');
        }

        return res.status(200).json({ message: 'Idea liked successfully' });
    } catch (error) {
        console.error('Like idea error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function unlikeIdea(
    req: AuthenticatedRequest,
    res: VercelResponse,
    ideaId: string
) {
    try {
        const token = req.headers.authorization!.replace('Bearer ', '');
        const authSupabase = createAuthenticatedClient(token);

        const { error } = await authSupabase
            .from('idea_likes')
            .delete()
            .eq('idea_id', ideaId)
            .eq('user_id', req.user!.id);

        if (error) {
            console.error('Unlike idea error:', error);
            return errorResponse(res, 500, 'Failed to unlike idea');
        }

        return res.status(200).json({ message: 'Idea unliked successfully' });
    } catch (error) {
        console.error('Unlike idea error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

async function addComment(
    req: AuthenticatedRequest,
    res: VercelResponse,
    ideaId: string,
    content: string
) {
    if (!content || content.trim().length === 0) {
        return errorResponse(res, 400, 'Comment content is required');
    }

    try {
        const token = req.headers.authorization!.replace('Bearer ', '');
        const authSupabase = createAuthenticatedClient(token);

        const { data: comment, error } = await authSupabase
            .from('idea_comments')
            .insert({
                idea_id: ideaId,
                user_id: req.user!.id,
                content: content.trim(),
            })
            .select()
            .single();

        if (error) {
            console.error('Add comment error:', error);
            return errorResponse(res, 500, 'Failed to add comment');
        }

        return res.status(201).json({ comment });
    } catch (error) {
        console.error('Add comment error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

export default withOptionalAuth(handler);
