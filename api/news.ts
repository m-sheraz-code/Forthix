import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filter = 'latest' } = req.query;

    const newsItems = [
      {
        id: '1',
        title: 'DJ: Dow Jones Closes 49,006 for New Record',
        source: 'DJ News',
        time: '24 hours ago',
        category: 'Trading Economics',
      },
      {
        id: '2',
        title: 'NASDAQ: Futures Move to Extended Sessions',
        source: 'NASDAQ',
        time: '8 hours ago',
        category: 'Trading Economics',
      },
      {
        id: '3',
        title: 'BAL: Nasdaq Futures Up 0.5% as Markets Embrace Tech Stocks Once Again',
        source: 'BAL News',
        time: '1 day ago',
        category: 'Trading Economics',
      },
      {
        id: '4',
        title: 'NASDAQ: Bitcoin\'s New Streak is First Trader of 2026. What\'s Gonna be in This Year?',
        source: 'NASDAQ',
        time: '2 days ago',
        category: 'Trading Economics',
      },
      {
        id: '5',
        title: 'XAU/USD: Gold Prices Soar $242 as in Bullish S&B in Traders Scramble to Buy the Dip',
        source: 'Keep reading',
        time: '3 days ago',
        category: 'Keep reading',
      },
    ];

    res.status(200).json({ news: newsItems, filter });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
