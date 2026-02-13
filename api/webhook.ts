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
            image_url,
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
        let imageBuffer: Buffer | null = null;
        let detectedExtension: string | null = null;

        // Handle image from URL or base64
        if (image_url && typeof image_url === 'string') {
            try {
                const response = await fetch(image_url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const arrayBuffer = await response.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);

                // Try to get extension from content-type or URL
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.startsWith('image/')) {
                    detectedExtension = contentType.split('/')[1];
                    if (detectedExtension === 'jpeg') detectedExtension = 'jpg';
                } else {
                    const urlParts = image_url.split('.');
                    if (urlParts.length > 1) {
                        detectedExtension = urlParts.pop()!.split(/[?#]/)[0].toLowerCase();
                    }
                }
            } catch (fetchError: any) {
                console.error('Image download error:', fetchError);
                return errorResponse(res, 500, `Image download failed: ${fetchError.message}`);
            }
        } else if (image_base64 && typeof image_base64 === 'string') {
            // Detect extension from base64
            if (image_base64.startsWith('data:image/')) {
                const match = image_base64.match(/^data:image\/(\w+);/);
                if (match) {
                    detectedExtension = match[1] === 'jpeg' ? 'jpg' : match[1];
                }
            }

            // Clean and convert to buffer
            const base64Clean = image_base64.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Clean, 'base64');
        }

        // Upload image if we have a buffer
        if (imageBuffer) {
            try {
                const finalExtension = getFileExtension(image_filename, detectedExtension);
                imageUrl = await uploadImageToStorage(adminClient, imageBuffer, image_filename, type, finalExtension);
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
    imageBuffer: Buffer,
    filename: string | undefined,
    type: string,
    extension: string
): Promise<string> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const storagePath = `${type}/${timestamp}-${randomId}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('images')
        .upload(storagePath, imageBuffer, {
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
function getFileExtension(filename: string | undefined, detectedExtension: string | null): string {
    if (filename) {
        const parts = filename.split('.');
        if (parts.length > 1) {
            return parts.pop()!.toLowerCase();
        }
    }

    return detectedExtension || 'jpg'; // Default to detected or jpg
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
