/**
 * API Client for Forthix Trading Platform
 * All frontend data fetching goes through these methods
 */

const API_BASE = '/api';

interface ApiError {
    error: string;
    message?: string;
    details?: unknown;
}

interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
}

// Base fetch wrapper
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                data: null,
                error: data as ApiError,
            };
        }

        return {
            data: data as T,
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: {
                error: 'Network error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
        };
    }
}

// ============================================
// MARKET DATA API
// ============================================

export interface Quote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    exchange?: string;
    previousClose?: number;
    open?: number;
    dayHigh?: number;
    dayLow?: number;
    volume?: number;
    marketCap?: number;
    chartData?: Array<{ time: string; value: number }>;
}

export interface MarketSummary {
    indices: Quote[];
    featured: {
        symbol: string;
        name: string;
        chartData: Array<{ time: string; value: number }>;
    };
    summary: {
        dollarIndex: number;
        dollarIndexChange: number;
        us10Year: number;
        us10YearChange: number;
    };
    movers: {
        gainers: Quote[];
        losers: Quote[];
        mostActive: Quote[];
    };
    timestamp: string;
}

export async function getMarketSummary() {
    return apiFetch<MarketSummary>('/markets/summary');
}

export async function getIndexData(symbol: string, range = '1d') {
    return apiFetch<Quote & { chartData: any[] }>(`/indices?symbol=${symbol}&range=${range}`);
}

export async function getStockData(symbol: string, range = '1d') {
    return apiFetch<Quote & { chartData: any[] }>(`/stocks?symbol=${symbol}&range=${range}`);
}

export async function searchStocks(query: string) {
    return apiFetch<{
        query: string;
        results: Array<{ symbol: string; name: string; type: string; exchange: string }>;
    }>(`/stocks/search?q=${encodeURIComponent(query)}`);
}

export async function getChartData(symbol: string, range = '1d') {
    return apiFetch<{
        symbol: string;
        range: string;
        data: Array<{
            time: string;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
        }>;
        stats: {
            high: number;
            low: number;
            change: number;
            changePercent: number;
        };
    }>(`/charts?symbol=${symbol}&range=${range}`);
}
// IDEAS API
// ============================================

export interface Idea {
    id: string;
    title: string;
    content?: string;
    symbol?: string;
    image?: string;
    likes: number;
    author: string;
    authorAvatar?: string;
    time: string;
    created_at: string;
    comments?: Array<{
        id: string;
        content: string;
        author: string;
        authorAvatar?: string;
        created_at: string;
    }>;
    commentCount?: number;
}

export async function getIdeas(filter = 'latest', symbol?: string) {
    let url = `/ideas?filter=${filter}`;
    if (symbol) url += `&symbol=${symbol}`;
    return apiFetch<{ ideas: Idea[]; filter: string }>(url);
}

export async function getIdea(id: string) {
    return apiFetch<{ idea: Idea }>(`/ideas/${id}`);
}

export async function createIdea(data: {
    title: string;
    content?: string;
    symbol?: string;
    image_url?: string;
}) {
    return apiFetch<{ idea: Idea }>('/ideas', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function likeIdea(id: string) {
    return apiFetch<{ message: string }>(`/ideas/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'like' }),
    });
}

export async function unlikeIdea(id: string) {
    return apiFetch<{ message: string }>(`/ideas/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'unlike' }),
    });
}

export async function commentOnIdea(id: string, content: string) {
    return apiFetch<{ comment: any }>(`/ideas/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'comment', content }),
    });
}

// ============================================
// SAVED CHARTS API
// ============================================

export interface SavedChart {
    id: string;
    symbol: string;
    name: string;
    config: Record<string, unknown>;
    created_at: string;
}

export async function getSavedCharts() {
    return apiFetch<{ charts: SavedChart[] }>('/charts?saved=true');
}

export async function saveChart(symbol: string, name?: string, config?: Record<string, unknown>) {
    return apiFetch<{ chart: SavedChart }>('/charts?saved=true', {
        method: 'POST',
        body: JSON.stringify({ symbol, name, config }),
    });
}

// ============================================
// NEWS API
// ============================================

export async function getNews(filter = 'latest', limit?: number) {
    const query = new URLSearchParams({ filter });
    if (limit) query.append('limit', limit.toString());
    return apiFetch<{ news: any[]; filter: string }>(`/news?${query.toString()}`);
}
// ============================================
// CHAT API
// ============================================

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function getChatResponse(messages: ChatMessage[], model?: string) {
    return apiFetch<any>('/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, model }),
    });
}
