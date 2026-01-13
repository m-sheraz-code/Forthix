import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketSummary, getMarketMovers, getChartData } from '../lib/yahoo-finance.js';
import { handleOptions, setCorsHeaders, errorResponse } from '../lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    // Fetch market summary and movers in parallel with individual error handling
    const [marketDataRes, moversRes, spxChartRes] = await Promise.allSettled([
      getMarketSummary(),
      getMarketMovers(),
      getChartData('SPX', '1d'),
    ]);

    const marketData = marketDataRes.status === 'fulfilled' ? marketDataRes.value : { indices: [], summary: { dollarIndex: 0, dollarIndexChange: 0, us10Year: 0, us10YearChange: 0 } };
    const movers = moversRes.status === 'fulfilled' ? moversRes.value : { gainers: [], losers: [], mostActive: [] };
    const spxChart = spxChartRes.status === 'fulfilled' ? spxChartRes.value : [];

    // Build response with indices including chart data
    const indicesWithCharts = await Promise.all(
      (marketData.indices || []).map(async (index) => {
        try {
          // Get mini chart data for each index
          const chartData = await getChartData(index.symbol, '1d');
          return {
            ...index,
            chartData: (chartData || []).slice(-30).map((d) => ({
              time: d.time,
              value: d.close,
            })),
          };
        } catch (err) {
          console.warn(`Failed to fetch chart for ${index.symbol}:`, err);
          return { ...index, chartData: [] };
        }
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
        gainers: (movers.gainers || []).slice(0, 3),
        losers: (movers.losers || []).slice(0, 3),
        mostActive: (movers.mostActive || []).slice(0, 3),
      },
      timestamp: new Date().toISOString(),
    };

    // Set cache headers for CDN caching - more aggressive for dev stability
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=150');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Market summary error:', error);
    // Even in error, return a partial object if possible instead of 500
    return res.status(200).json({
      indices: [],
      featured: { symbol: 'SPX', name: 'S&P 500', chartData: [] },
      summary: { dollarIndex: 0, dollarIndexChange: 0, us10Year: 0, us10YearChange: 0 },
      movers: { gainers: [], losers: [], mostActive: [] },
      timestamp: new Date().toISOString(),
      error: 'Partial data available'
    });
  }
}
