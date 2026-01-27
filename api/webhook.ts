import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_lib/supabase.js';
import { handleOptions, setCorsHeaders, errorResponse } from './_lib/middleware.js';

/**
 * n8n Webhook Endpoint for Blog Automation
 * 
 * Accepts POST requests to create news articles or ideas with image upload support.
 * Images are uploaded to Supabase Storage and the public URL is stored in the database.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed. Use POST.');
    }

    try {
        const {
            type,
            title,
            content,
            symbol,
            category,
            image_base64,
            image_filename,
            api_key,
        } = req.body;

        // Validate API key
        const validApiKey = process.env.N8N_WEBHOOK_API_KEY;
        if (!validApiKey || api_key !== validApiKey) {
            return errorResponse(res, 401, 'Invalid or missing API key');
        }

        // Validate required fields
        if (!type || !['news', 'idea'].includes(type)) {
            return errorResponse(res, 400, 'Invalid type. Must be "news" or "idea"');
        }

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return errorResponse(res, 400, 'Title is required');
        }

        // Get admin client for bypassing RLS
        const adminClient = getAdminClient();
        if (!adminClient) {
            console.error('Admin client unavailable - check SUPABASE_SERVICE_ROLE_KEY');
            return errorResponse(res, 500, 'Server configuration error');
        }

        let imageUrl: string | null = null;

        // Handle image upload if provided
        if (image_base64 && typeof image_base64 === 'string') {
            try {
                imageUrl = await uploadImageToStorage(adminClient, image_base64, image_filename, type);
            } catch (uploadError: any) {
                console.error('Image upload error:', uploadError);
                return errorResponse(res, 500, `Image upload failed: ${uploadError.message}`);
            }
        }

        // Create record based on type
        if (type === 'news') {
            return await createNews(adminClient, res, {
                title: title.trim(),
                content: content || null,
                image_url: imageUrl,
                category: category || 'BREAKING',
            });
        } else {
            return await createIdea(adminClient, res, {
                title: title.trim(),
                content: content || null,
                image_url: imageUrl,
                symbol: symbol ? symbol.toUpperCase() : null,
            });
        }
    } catch (error: any) {
        console.error('Webhook error:', error);
        return errorResponse(res, 500, 'Internal server error');
    }
}

/**
 * Upload base64 image to Supabase Storage
 */
async function uploadImageToStorage(
    supabase: any,
    base64Data: string,
    filename: string | undefined,
    type: string
): Promise<string> {
    // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Decode base64 to buffer
    const buffer = Buffer.from(base64Clean, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = getFileExtension(filename, base64Data);
    const storagePath = `${type}/${timestamp}-${randomId}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('images')
        .upload(storagePath, buffer, {
            contentType: getContentType(extension),
            cacheControl: '31536000', // 1 year cache
            upsert: false,
        });

    if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(storagePath);

    return publicUrlData.publicUrl;
}

/**
 * Get file extension from filename or detect from base64 data
 */
function getFileExtension(filename: string | undefined, base64Data: string): string {
    if (filename) {
        const parts = filename.split('.');
        if (parts.length > 1) {
            return parts.pop()!.toLowerCase();
        }
    }

    // Try to detect from data URI
    if (base64Data.startsWith('data:image/')) {
        const match = base64Data.match(/^data:image\/(\w+);/);
        if (match) {
            return match[1] === 'jpeg' ? 'jpg' : match[1];
        }
    }

    return 'jpg'; // Default to jpg
}

/**
 * Get content type from extension
 */
function getContentType(extension: string): string {
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
    };
    return mimeTypes[extension] || 'image/jpeg';
}

/**
 * Create a news article
 */
async function createNews(
    supabase: any,
    res: VercelResponse,
    data: { title: string; content: string | null; image_url: string | null; category: string }
) {
    const { data: news, error } = await supabase
        .from('news')
        .insert({
            title: data.title,
            content: data.content,
            image_url: data.image_url,
            category: data.category,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('News creation error:', error);
        return errorResponse(res, 500, `Failed to create news: ${error.message}`);
    }

    return res.status(201).json({
        success: true,
        type: 'news',
        data: {
            id: news.id,
            title: news.title,
            content: news.content,
            image_url: news.image_url,
            category: news.category,
            created_at: news.created_at,
        },
    });
}

/**
 * Create an idea
 */
async function createIdea(
    supabase: any,
    res: VercelResponse,
    data: { title: string; content: string | null; image_url: string | null; symbol: string | null }
) {
    const { data: idea, error } = await supabase
        .from('ideas')
        .insert({
            user_id: null, // System/n8n created ideas have null user_id
            title: data.title,
            content: data.content,
            image_url: data.image_url,
            symbol: data.symbol,
            likes: 0,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Idea creation error:', error);
        return errorResponse(res, 500, `Failed to create idea: ${error.message}`);
    }

    return res.status(201).json({
        success: true,
        type: 'idea',
        data: {
            id: idea.id,
            title: idea.title,
            content: idea.content,
            image_url: idea.image_url,
            symbol: idea.symbol,
            created_at: idea.created_at,
        },
    });
}
