/**
 * Yahoo Finance API wrapper using yahoo-finance2 package
 * Provides methods for fetching market data with caching
 */

import yahooFinance from 'yahoo-finance2';
import { CACHE_TTL, withCache } from './cache.js';

// Prevent yahoo-finance2 from using problematic environment proxies
if (typeof process !== 'undefined' && process.env) {
    delete process.env.HTTP_PROXY;
    delete process.env.http_proxy;
    delete process.env.HTTPS_PROXY;
    delete process.env.https_proxy;
}

import https from 'https';

/**
 * Resilient fetch using native https module to bypass fetch-level redirection/proxy issues
 */
async function rawFetch(url: string, asText = false): Promise<any> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            req.destroy();
            reject(new Error(`Request timeout for ${url}`));
        }, 8000); // 8 second timeout

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        };

        const req = https.get(url, options, (res) => {
            clearTimeout(timeout);
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        resolve(asText ? data : JSON.parse(data));
                    } else if (res.statusCode === 401 || res.statusCode === 403) {
                        if (asText) {
                            resolve(data);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode} (Unauthorized/Forbidden). Blocked.`));
                        }
                    } else if (res.statusCode === 429) {
                        reject(new Error('HTTP 429: Too Many Requests'));
                    } else {
                        if (asText && data) {
                            resolve(data);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

// Symbol mappings for major indices
const INDEX_SYMBOLS: Record<string, string> = {
    'SPX': '^GSPC',      // S&P 500
    'NDX': '^NDX',       // Nasdaq 100
    'IXIC': '^IXIC',     // Nasdaq Composite
    'DJI': '^DJI',       // Dow Jones
    'N225': '^N225',     // Nikkei 225
    'FTSE': '^FTSE',     // FTSE 100
    'DAX': '^GDAXI',     // DAX
    'CAC': '^FCHI',      // CAC 40
    'HSI': '^HSI',       // Hang Seng
    'SSEC': '000001.SS', // SSE Composite
    'VIX': '^VIX',       // Volatility Index
    'RUT': '^RUT',       // Russell 2000
    'TSX': '^GSPTSE',    // S&P/TSX Composite
    'AXJO': '^AXJO',     // ASX 200
    'STOXX': '^STOXX50E',// Euro Stoxx 50
    'IBEX': '^IBEX',     // IBEX 35
    'NSEI': '^NSEI',     // Nifty 50
    'BVSP': '^BVSP',     // Bovespa
    'MXX': '^MXX',       // Mexico IPC
    'SSMI': '^SSMI',     // Swiss Market Index
    'TNX': '^TNX',       // 10-Year Treasury Yield
};

// Chart range to Yahoo Finance interval mapping
const RANGE_CONFIG: Record<string, { range: string; interval: string }> = {
    '1d': { range: '1d', interval: '5m' },
    '5d': { range: '5d', interval: '15m' },
    '1m': { range: '1mo', interval: '1h' },
    '3m': { range: '3mo', interval: '1d' },
    '6m': { range: '6mo', interval: '1d' },
    'ytd': { range: 'ytd', interval: '1d' },
    '1y': { range: '1y', interval: '1d' },
    '5y': { range: '5y', interval: '1wk' },
    'all': { range: 'max', interval: '1mo' },
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
    const yahooSymbol = INDEX_SYMBOLS[symbol.toUpperCase()] || symbol.toUpperCase();
    const cacheKey = `quote_${yahooSymbol}`;

    try {
        return await withCache(cacheKey, CACHE_TTL.REALTIME, async () => {
            console.log(`[Yahoo Finance] Fetching quote for ${yahooSymbol}...`);

            let quote: any;
            try {
                // Try library first
                const rawQuote: any = await yahooFinance.quote(yahooSymbol);
                quote = Array.isArray(rawQuote) ? rawQuote[0] : rawQuote;
            } catch (libErr: any) {
                console.warn(`[Yahoo Finance] Library fetch failed for ${yahooSymbol}. Trying resilient chart fetch...`);
                try {
                    // Fallback to chart API
                    const result = await rawFetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`);
                    const meta = result?.chart?.result?.[0]?.meta;
                    if (meta) {
                        quote = {
                            regularMarketPrice: meta.regularMarketPrice,
                            regularMarketChange: meta.regularMarketPrice - meta.chartPreviousClose,
                            regularMarketChangePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
                            regularMarketPreviousClose: meta.chartPreviousClose,
                            shortName: meta.symbol,
                            symbol: meta.symbol,
                            exchangeName: meta.exchangeName
                        };
                    } else {
                        throw new Error('No meta in chart response');
                    }
                } catch (rawErr: any) {
                    console.warn(`[Yahoo Finance] Resilient chart fetch failed for ${yahooSymbol}: ${rawErr.message}. Trying Google Finance fallback...`);
                    try {
                        // Final fallback: Google Finance scraper
                        // Map internal symbols to potential Google Finance symbols (try multiple if needed)
                        const googleMap: Record<string, string[]> = {
                            '^GSPC': ['.INX:INDEXSP', 'SPX'],
                            '^NDX': ['NDX:INDEXNASDAQ', 'NDX', '.IXIC'],
                            '^DJI': ['.DJI:INDEXDJX', 'DJI'],
                            '^TNX': ['TNX:INDEXCBOE', 'TNX'],
                            'DX-Y.NYB': ['DXY:CURRENCY', 'DXY'],
                            '^N225': ['NI225:INDEXNIKKEI', 'N225'],
                            '^FTSE': ['UKX:INDEXFTSE', 'FTSE'],
                            '^GDAXI': ['DAX:INDEXDB', 'DAX'],
                            '^FCHI': ['PX1:INDEXEURO', 'CAC'],
                            '^HSI': ['HSI:INDEXHONGKONG', 'HSI'],
                        };

                        const potentialSymbols = googleMap[yahooSymbol] || [yahooSymbol];
                        let html = '';
                        let success = false;
                        let lastPrice = 0;
                        let foundName = symbol;

                        for (const gSym of potentialSymbols) {
                            try {
                                const scrapUrl = `https://www.google.com/finance/quote/${gSym}`;
                                console.log(`[Yahoo Finance] Trying Google Scraper for ${gSym}: ${scrapUrl}`);
                                html = await rawFetch(scrapUrl, true);

                                // Universal price regex
                                const priceMatch = html.match(/class="[\w\d\s]*YMl78c[\w\d\s]*">\$?([\d,]+\.\d+)/) ||
                                    html.match(/data-last-price="([\d\.]+)"/) ||
                                    html.match(/>\$?([\d,]+\.\d+)</) ||
                                    html.match(/div[^>]*aria-label=".*" price="([\d\.]+)"/);

                                if (priceMatch) {
                                    lastPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
                                    if (lastPrice > 0) {
                                        const nameMatch = html.match(/class="[\w\d\s]*zzS5lb[\w\d\s]*">([^<]+)/) ||
                                            html.match(/<div class="zzS5lb">([^<]+)<\/div>/) ||
                                            html.match(/<h1[^>]*>([^<]+)<\/h1>/);
                                        foundName = nameMatch ? nameMatch[1] : gSym;
                                        success = true;
                                        console.log(`[Yahoo Finance] Scraper Success with ${gSym}: ${lastPrice}`);
                                        break;
                                    }
                                }
                            } catch (e) {
                                console.warn(`[Yahoo Finance] Google scraper failed for sub-symbol ${gSym}`);
                            }
                        }

                        if (success) {
                            quote = {
                                regularMarketPrice: lastPrice,
                                shortName: foundName,
                                symbol: symbol,
                                regularMarketChange: 0,
                                regularMarketChangePercent: 0
                            };
                        } else {
                            console.error(`[Yahoo Finance] All Google scraper symbols failed for ${yahooSymbol}`);
                            return null;
                        }
                    } catch (googleErr: any) {
                        console.error(`[Yahoo Finance] Final failure in scraper for ${yahooSymbol}: ${googleErr.message}`);
                        return null;
                    }
                }
            }

            if (!quote) {
                console.warn(`[Yahoo Finance] No quote data returned for ${yahooSymbol}`);
                return null;
            }

            // Extract price with fallbacks
            const price = quote.regularMarketPrice ??
                quote.postMarketPrice ??
                quote.preMarketPrice ??
                quote.bid ??
                quote.ask ??
                0;

            if (price === 0) {
                console.warn(`[Yahoo Finance] Price for ${yahooSymbol} is 0 or missing. Raw quote keys: ${Object.keys(quote).join(', ')}`);
            }

            return {
                symbol: symbol.toUpperCase(),
                name: quote.shortName || quote.longName || quote.symbol || symbol,
                price: price,
                change: quote.regularMarketChange ?? quote.postMarketChange ?? quote.preMarketChange ?? 0,
                changePercent: quote.regularMarketChangePercent ?? quote.postMarketChangePercent ?? quote.preMarketChangePercent ?? 0,
                previousClose: quote.regularMarketPreviousClose ?? 0,
                open: quote.regularMarketOpen ?? 0,
                dayHigh: quote.regularMarketHigh ?? quote.regularMarketDayHigh ?? 0,
                dayLow: quote.regularMarketLow ?? quote.regularMarketDayLow ?? 0,
                volume: quote.regularMarketVolume ?? 0,
                marketCap: quote.marketCap,
                exchange: quote.exchange || quote.fullExchangeName,
            };
        });
    } catch (error) {
        console.error(`[Yahoo Finance] Error fetching quote for ${symbol} (${yahooSymbol}):`, error);
        return null;
    }
}

/**
 * Get quotes for multiple symbols
 */
export async function getQuotes(symbols: string[]): Promise<QuoteData[]> {
    const quotes: QuoteData[] = [];

    // Process sequentially with small delay to avoid 429 Rate Limiting
    for (const symbol of symbols) {
        const quote = await getQuote(symbol);
        if (quote) {
            quotes.push(quote);
        }
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    return quotes;
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
            console.log(`[Yahoo Finance] Fetching chart for ${yahooSymbol} (${range})...`);

            let data: any;
            try {
                // Try library first
                const result: any = await yahooFinance.chart(yahooSymbol, {
                    period1: getStartDate(range),
                    interval: config.interval as any,
                });
                data = result?.quotes;
            } catch (libErr: any) {
                console.warn(`[Yahoo Finance] Library chart fetch failed for ${yahooSymbol}. Trying resilient raw fetch...`);
                try {
                    const params = `?interval=${config.interval}&range=${config.range}`;
                    const result = await rawFetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}${params}`);
                    const chartResult = result?.chart?.result?.[0];

                    if (chartResult && chartResult.timestamp) {
                        const timestamps = chartResult.timestamp;
                        const indicators = chartResult.indicators.quote[0];

                        data = timestamps.map((ts: number, i: number) => ({
                            date: new Date(ts * 1000),
                            open: indicators.open[i],
                            high: indicators.high[i],
                            low: indicators.low[i],
                            close: indicators.close[i],
                            volume: indicators.volume[i]
                        }));
                    }
                } catch (rawErr: any) {
                    console.error(`[Yahoo Finance] Resilient chart fetch failed for ${yahooSymbol}: ${rawErr.message}`);
                    return [];
                }
            }

            if (!data) {
                return [];
            }

            return data
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
        console.error(`[Yahoo Finance] Final error fetching chart data for ${symbol}:`, error);
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
            let results: any;
            try {
                // Try library first
                results = await yahooFinance.search(query, {
                    quotesCount: 10,
                    newsCount: 0,
                });
            } catch (libErr: any) {
                console.warn(`[Yahoo Finance] Library search failed for ${query}: ${libErr.message}. Trying resilient fetch...`);
                try {
                    // Fallback to raw search endpoint
                    results = await rawFetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`);
                } catch (rawErr: any) {
                    console.error(`[Yahoo Finance] Resilient search fetch failed for ${query}: ${rawErr.message}`);
                    return [];
                }
            }

            if (!results || !results.quotes) {
                return [];
            }

            return results.quotes
                .filter((q: any) => q.symbol)
                .map((q: any) => ({
                    symbol: q.symbol,
                    name: q.shortname || q.longname || q.name || q.symbol,
                    type: q.quoteType || q.typeDisp || 'EQUITY',
                    exchange: q.exchange || 'Unknown',
                }));
        });
    } catch (error) {
        console.error(`Error searching for ${query}:`, error);
        return [];
    }
}

export async function getMarketNews(query: string = 'market news'): Promise<any[]> {
    const cacheKey = `news:${query.toLowerCase()}`;

    try {
        return await withCache(cacheKey, CACHE_TTL.NEWS, async () => {
            console.log(`[Yahoo Finance] Fetching news for ${query}...`);
            const result: any = await yahooFinance.search(query, {
                newsCount: 15,
                quotesCount: 0,
            });

            console.log(`[Yahoo Finance] Search result keys:`, Object.keys(result));
            console.log(`[Yahoo Finance] News count:`, result.news?.length || 0);

            if (!result.news || result.news.length === 0) {
                console.warn(`[Yahoo Finance] No news found for query: ${query}`);
                if (query === 'market news') {
                    console.log(`[Yahoo Finance] Retrying with broader query: 'finance'`);
                    return getMarketNews('finance');
                }
                return [];
            }

            return result.news.map((item: any) => ({
                id: item.uuid || Math.random().toString(36).substring(7),
                title: item.title,
                source: item.publisher,
                link: item.link,
                time: item.providerPublishTime,
                category: 'Market News',
                thumbnail: item.thumbnail?.resolutions?.[0]?.url
            }));
        });
    } catch (error) {
        console.error(`Error fetching news for ${query}:`, error);
        return [];
    }
}
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
            const usIndicators = [
                'SPX',   // S&P 500
                'IXIC',  // Nasdaq Composite
                'DJI',   // Dow Jones
                'RUT',   // Russell 2000
                'VIX',   // VIX
                'TNX'    // 10Y Yield
            ];
            const indices = await getQuotes(usIndicators);

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
            // Globally diversified list for true market coverage
            const popularStocks = [
                // Tech Giants & Chips
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL',
                'AMD', 'INTC', 'TSM', 'QCOM', 'ASML', 'ADBE', 'CRM', 'SAP',
                // Finance & Payment
                'JPM', 'BAC', 'V', 'MA', 'PYPL', 'HSBA.L', 'RY', 'C',
                // Europe Giants
                'MC.PA', 'OR.PA', 'SHEL.L', 'AZN.L', 'NOVO-B.CO', 'SIE.DE', 'TTE.PA', 'NESN.SW',
                // Asia Giants
                '7203.T', '005930.KS', '0700.HK', '9988.HK', 'RELIANCE.NS', 'TCS.NS', '600519.SS', 'BHP.AX',
                // Software & Growth
                'NFLX', 'SHOP', 'PLTR', 'SNOW', 'U',
                // EV & Auto
                'RIVN', 'NIO', 'F', 'GM', 'RACE',
                // Consumer & Retail
                'WMT', 'COST', 'NKE', 'SBUX', 'UL', 'DIAGEO.L',
                // Energy & Industry
                'XOM', 'CVX', 'CAT', 'PBR', 'VALE', 'ABB'
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
        case '3m':
            return new Date(now.setMonth(now.getMonth() - 3));
        case '6m':
            return new Date(now.setMonth(now.getMonth() - 6));
        case 'ytd':
            return new Date(now.getFullYear(), 0, 1);
        case '1y':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        case '5y':
            return new Date(now.setFullYear(now.getFullYear() - 5));
        case 'all':
        case 'max':
            return new Date('1970-01-01');
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
}
