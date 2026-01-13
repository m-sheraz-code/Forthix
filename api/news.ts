import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketNews } from './lib/yahoo-finance.js';
import { handleOptions, setCorsHeaders, errorResponse } from './lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { filter = 'latest' } = req.query;

    // Use the centralized helper which also handles caching
    const newsResult = await getMarketNews(filter === 'latest' ? 'market news' : String(filter));

    // Format times for display (time is returned as Unix timestamp from yahoo-finance lib)
    const formattedNews = newsResult.map(item => ({
      ...item,
      time: formatTimeAgo(item.time)
    }));

    res.status(200).json({ news: formattedNews, filter });
  } catch (error: any) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
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
