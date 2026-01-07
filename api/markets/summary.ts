import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketSummary, getMarketMovers, getChartData } from '../lib/yahoo-finance';
import { handleOptions, setCorsHeaders, errorResponse } from '../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    // Fetch market summary and movers in parallel
    const [marketData, movers, spxChart] = await Promise.all([
      getMarketSummary(),
      getMarketMovers(),
      getChartData('SPX', '1d'), // S&P 500 chart for featured display
    ]);

    // Build response with indices including chart data
    const indicesWithCharts = await Promise.all(
      marketData.indices.map(async (index) => {
        // Get mini chart data for each index
        const chartData = await getChartData(index.symbol, '1d');
        return {
          ...index,
          chartData: chartData.slice(-30).map((d) => ({
            time: d.time,
            value: d.close,
          })),
        };
      })
    );

    // Format response
    const response = {
      indices: indicesWithCharts,
      featured: {
        symbol: 'SPX',
        name: 'S&P 500',
        chartData: spxChart.slice(-60).map((d) => ({
          time: d.time,
          value: d.close,
        })),
      },
      summary: marketData.summary,
      movers: {
        gainers: movers.gainers.slice(0, 3),
        losers: movers.losers.slice(0, 3),
        mostActive: movers.mostActive.slice(0, 3),
      },
      timestamp: new Date().toISOString(),
    };

    // Set cache headers for CDN caching
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Market summary error:', error);
    return errorResponse(res, 500, 'Failed to fetch market data');
  }
}
