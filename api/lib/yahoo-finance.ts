/**
 * Yahoo Finance API wrapper using yahoo-finance2 package
 * Provides methods for fetching market data with caching
 */

import yahooFinance from 'yahoo-finance2';
import { CACHE_TTL, withCache } from './cache';

// Symbol mappings for major indices
const INDEX_SYMBOLS: Record<string, string> = {
    'SPX': '^GSPC',      // S&P 500
    'NDX': '^NDX',       // Nasdaq 100
    'DJI': '^DJI',       // Dow Jones
    'N225': '^N225',     // Nikkei 225
    'FTSE': '^FTSE',     // FTSE 100
    'DAX': '^GDAXI',     // DAX
    'CAC': '^FCHI',      // CAC 40
    'HSI': '^HSI',       // Hang Seng
    'SSEC': '000001.SS', // SSE Composite
    'VIX': '^VIX',       // Volatility Index
};

// Chart range to Yahoo Finance interval mapping
const RANGE_CONFIG: Record<string, { range: string; interval: string }> = {
    '1d': { range: '1d', interval: '5m' },
    '5d': { range: '5d', interval: '15m' },
    '1m': { range: '1mo', interval: '1h' },
    '6m': { range: '6mo', interval: '1d' },
    'ytd': { range: 'ytd', interval: '1d' },
    '1y': { range: '1y', interval: '1d' },
    '5y': { range: '5y', interval: '1wk' },
    'max': { range: 'max', interval: '1mo' },
};

export interface QuoteData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    previousClose: number;
    open: number;
    dayHigh: number;
    dayLow: number;
    volume: number;
    marketCap?: number;
    exchange?: string;
}

export interface ChartDataPoint {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
}

/**
 * Convert internal symbol to Yahoo Finance symbol
 */
export function toYahooSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    return INDEX_SYMBOLS[upperSymbol] || symbol;
}

/**
 * Get quote for a single symbol
 */
export async function getQuote(symbol: string): Promise<QuoteData | null> {
    const yahooSymbol = toYahooSymbol(symbol);
    const cacheKey = `quote:${yahooSymbol}`;

    try {
        return await withCache(cacheKey, CACHE_TTL.REALTIME, async () => {
            const quote: any = await yahooFinance.quote(yahooSymbol);

            if (!quote) {
                return null;
            }

            return {
                symbol: symbol.toUpperCase(),
                name: quote.shortName || quote.longName || symbol,
                price: quote.regularMarketPrice || 0,
                change: quote.regularMarketChange || 0,
                changePercent: quote.regularMarketChangePercent || 0,
                previousClose: quote.regularMarketPreviousClose || 0,
                open: quote.regularMarketOpen || 0,
                dayHigh: quote.regularMarketDayHigh || 0,
                dayLow: quote.regularMarketDayLow || 0,
                volume: quote.regularMarketVolume || 0,
                marketCap: quote.marketCap,
                exchange: quote.exchange,
            };
        });
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return null;
    }
}

/**
 * Get quotes for multiple symbols
 */
export async function getQuotes(symbols: string[]): Promise<QuoteData[]> {
    const results = await Promise.allSettled(
        symbols.map((symbol) => getQuote(symbol))
    );

    return results
        .filter(
            (result): result is PromiseFulfilledResult<QuoteData | null> =>
                result.status === 'fulfilled' && result.value !== null
        )
        .map((result) => result.value as QuoteData);
}

/**
 * Get historical chart data for a symbol
 */
export async function getChartData(
    symbol: string,
    range: string = '1d'
): Promise<ChartDataPoint[]> {
    const yahooSymbol = toYahooSymbol(symbol);
    const config = RANGE_CONFIG[range] || RANGE_CONFIG['1d'];
    const cacheKey = `chart:${yahooSymbol}:${range}`;

    try {
        return await withCache(cacheKey, CACHE_TTL.HISTORICAL, async () => {
            const result: any = await yahooFinance.chart(yahooSymbol, {
                period1: getStartDate(range),
                interval: config.interval as any,
            });

            if (!result || !result.quotes) {
                return [];
            }

            return result.quotes
                .filter((q: any) => q.close !== null)
                .map((q: any) => ({
                    time: q.date.toISOString(),
                    open: q.open || 0,
                    high: q.high || 0,
                    low: q.low || 0,
                    close: q.close || 0,
                    volume: q.volume || 0,
                }));
        });
    } catch (error) {
        console.error(`Error fetching chart data for ${symbol}:`, error);
        return [];
    }
}

/**
 * Search for symbols
 */
export async function searchSymbols(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 1) {
        return [];
    }

    const cacheKey = `search:${query.toLowerCase()}`;

    try {
        return await withCache(cacheKey, CACHE_TTL.SEARCH, async () => {
            const results: any = await yahooFinance.search(query, {
                quotesCount: 10,
                newsCount: 0,
            });

            if (!results || !results.quotes) {
                return [];
            }

            return results.quotes
                .filter((q: any) => q.symbol && q.shortname)
                .map((q: any) => ({
                    symbol: q.symbol,
                    name: q.shortname || q.longname || q.symbol,
                    type: q.quoteType || 'EQUITY',
                    exchange: q.exchange || 'Unknown',
                }));
        });
    } catch (error) {
        console.error(`Error searching for ${query}:`, error);
        return [];
    }
}

/**
 * Get market summary for major indices
 */
export async function getMarketSummary(): Promise<{
    indices: QuoteData[];
    summary: {
        dollarIndex: number;
        dollarIndexChange: number;
        us10Year: number;
        us10YearChange: number;
    };
}> {
    const cacheKey = 'market:summary';

    try {
        return await withCache(cacheKey, CACHE_TTL.REALTIME, async () => {
            const majorIndices = ['SPX', 'NDX', 'DJI', 'N225', 'FTSE', 'DAX'];
            const indices = await getQuotes(majorIndices);

            // Fetch additional market data
            const [dxyQuote, tnxQuote] = await Promise.allSettled([
                getQuote('DX-Y.NYB'), // Dollar Index
                getQuote('^TNX'),     // 10-Year Treasury
            ]);

            const dxy = dxyQuote.status === 'fulfilled' ? dxyQuote.value : null;
            const tnx = tnxQuote.status === 'fulfilled' ? tnxQuote.value : null;

            return {
                indices,
                summary: {
                    dollarIndex: dxy?.price || 100.0,
                    dollarIndexChange: dxy?.changePercent || 0,
                    us10Year: tnx?.price || 4.0,
                    us10YearChange: tnx?.changePercent || 0,
                },
            };
        });
    } catch (error) {
        console.error('Error fetching market summary:', error);
        return {
            indices: [],
            summary: {
                dollarIndex: 0,
                dollarIndexChange: 0,
                us10Year: 0,
                us10YearChange: 0,
            },
        };
    }
}

/**
 * Get gainers, losers, and most active stocks
 */
export async function getMarketMovers(): Promise<{
    gainers: QuoteData[];
    losers: QuoteData[];
    mostActive: QuoteData[];
}> {
    const cacheKey = 'market:movers';

    try {
        return await withCache(cacheKey, CACHE_TTL.REALTIME, async () => {
            // Popular stocks to track for movers
            const popularStocks = [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
                'AMD', 'INTC', 'CRM', 'NFLX', 'PYPL', 'SQ', 'SHOP', 'ZM',
                'COIN', 'PLTR', 'SOFI', 'HOOD', 'RIVN', 'LCID', 'NIO',
            ];

            const quotes = await getQuotes(popularStocks);

            // Sort for gainers (top 5 by percent change)
            const gainers = [...quotes]
                .filter((q) => q.changePercent > 0)
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 5);

            // Sort for losers (bottom 5 by percent change)
            const losers = [...quotes]
                .filter((q) => q.changePercent < 0)
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 5);

            // Sort for most active (top 5 by volume)
            const mostActive = [...quotes]
                .sort((a, b) => b.volume - a.volume)
                .slice(0, 5);

            return { gainers, losers, mostActive };
        });
    } catch (error) {
        console.error('Error fetching market movers:', error);
        return { gainers: [], losers: [], mostActive: [] };
    }
}

/**
 * Helper to calculate start date for chart ranges
 */
function getStartDate(range: string): Date {
    const now = new Date();

    switch (range) {
        case '1d':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '5d':
            return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        case '1m':
            return new Date(now.setMonth(now.getMonth() - 1));
        case '6m':
            return new Date(now.setMonth(now.getMonth() - 6));
        case 'ytd':
            return new Date(now.getFullYear(), 0, 1);
        case '1y':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        case '5y':
            return new Date(now.setFullYear(now.getFullYear() - 5));
        case 'max':
            return new Date('1970-01-01');
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
}
