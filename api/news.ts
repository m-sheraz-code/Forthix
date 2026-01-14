import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketNews } from './lib/yahoo-finance.js';
import { supabase, getAdminClient } from './lib/supabase.js';
import { handleOptions, setCorsHeaders, errorResponse } from './lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return errorResponse(res, 405, 'Method not allowed');
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    const { filter = 'latest' } = req.query;

    // 1. Fetch from Yahoo Finance
    const yahooNews = await getMarketNews(filter === 'latest' ? 'market news' : String(filter));

    // 2. Fetch from Supabase (custom news)
    const { data: customNews, error: supabaseError } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (supabaseError) {
      console.error('Supabase news fetch error:', supabaseError);
    }

    // 3. Format Custom News
    const formattedCustomNews = (customNews || []).map(item => ({
      id: item.id,
      title: item.title,
      source: 'Forthix Editor',
      time: formatTimeAgo(item.created_at),
      category: 'BREAKING',
      thumbnail: item.image_url,
      content: item.content,
      publishedAt: item.created_at,
      link: `/news/${item.id}`
    }));

    // 4. Format Yahoo News
    const formattedYahooNews = yahooNews.map(item => ({
      id: item.id || `yh-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      source: item.publisher || 'Market News',
      time: formatTimeAgo(item.time),
      category: 'MARKET',
      thumbnail: (item as any).thumbnail?.resolutions?.[0]?.url,
      publishedAt: typeof item.time === 'number' ? new Date(item.time * 1000).toISOString() : new Date(item.time).toISOString(),
      link: (item as any).link
    }));

    // Combine (Custom first)
    const combinedNews = [...formattedCustomNews, ...formattedYahooNews];

    res.status(200).json({ news: combinedNews, filter });
  } catch (error: any) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    const { title, content, image_url, username, password } = req.body;

    // Simple auth check for admin
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    if (!title || !content) {
      return errorResponse(res, 400, 'Title and content are required');
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      console.error('ERROR: getAdminClient() returned null. Check SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL.');
      return errorResponse(res, 500, 'Admin client unavailable');
    }

    console.log(`Creating news item with title: "${title}"`);
    const { data, error } = await adminClient
      .from('news')
      .insert({
        title,
        content,
        image_url: image_url || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Database Error:', error);
      return errorResponse(res, 500, `Database error: ${error.message}`);
    }

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Create news error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
}

function formatTimeAgo(publishTime: number | string): string {
  if (!publishTime) return 'recently';

  const date = typeof publishTime === 'number' ? new Date(publishTime * 1000) : new Date(publishTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
