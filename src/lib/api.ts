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

// Get stored auth token
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('forthix_token');
}

// Set auth token
export function setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
        localStorage.setItem('forthix_token', token);
    } else {
        localStorage.removeItem('forthix_token');
    }
}

// Get refresh token
function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('forthix_refresh_token');
}

// Set refresh token
export function setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
        localStorage.setItem('forthix_refresh_token', token);
    } else {
        localStorage.removeItem('forthix_refresh_token');
    }
}

// Base fetch wrapper
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

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
// AUTH API
// ============================================

export interface User {
    id: string;
    email: string;
    created_at: string;
    profile?: {
        username: string;
        display_name: string;
        avatar_url: string | null;
        bio: string | null;
    };
    preferences?: {
        theme: 'light' | 'dark';
        default_chart_type: string;
        notifications_enabled: boolean;
    };
}

export interface Session {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export async function signup(email: string, password: string, username?: string) {
    const response = await apiFetch<{ user: User; session: Session | null }>('/auth?action=signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
    });

    if (response.data?.session) {
        setAuthToken(response.data.session.access_token);
        setRefreshToken(response.data.session.refresh_token);
    }

    return response;
}

export async function login(email: string, password: string) {
    const response = await apiFetch<{ user: User; session: Session }>('/auth?action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (response.data?.session) {
        setAuthToken(response.data.session.access_token);
        setRefreshToken(response.data.session.refresh_token);
    }

    return response;
}

export async function logout() {
    const response = await apiFetch<{ message: string }>('/auth?action=logout', {
        method: 'POST',
    });

    setAuthToken(null);
    setRefreshToken(null);

    return response;
}

export async function getCurrentUser() {
    return apiFetch<{ user: User }>('/auth?action=me');
}

export async function refreshSession() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return { data: null, error: { error: 'No refresh token' } };
    }

    const response = await apiFetch<{ session: Session; user: User | null }>('/auth?action=refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.data?.session) {
        setAuthToken(response.data.session.access_token);
        setRefreshToken(response.data.session.refresh_token);
    }

    return response;
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
    return apiFetch<Quote & { chartData: any[] }>(`/indices/${symbol}?range=${range}`);
}

export async function getStockData(symbol: string, range = '1d') {
    return apiFetch<Quote & { chartData: any[] }>(`/stocks/${symbol}?range=${range}`);
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

// ============================================
// WATCHLIST API
// ============================================

export interface Watchlist {
    id: string;
    name: string;
    symbols: string[];
    quotes?: Quote[];
    created_at: string;
    updated_at: string;
}

export async function getWatchlists(withPrices = false) {
    return apiFetch<{ watchlists: Watchlist[] }>(
        `/watchlist${withPrices ? '?withPrices=true' : ''}`
    );
}

export async function getWatchlist(id: string) {
    return apiFetch<{ watchlist: Watchlist }>(`/watchlist?id=${id}`);
}

export async function createWatchlist(name: string, symbols: string[] = []) {
    return apiFetch<{ watchlist: Watchlist }>('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ name, symbols }),
    });
}

export async function updateWatchlist(id: string, data: { name?: string; symbols?: string[] }) {
    return apiFetch<{ watchlist: Watchlist }>(`/watchlist?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteWatchlist(id: string) {
    return apiFetch<{ message: string }>(`/watchlist?id=${id}`, {
        method: 'DELETE',
    });
}

// ============================================
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
// PREFERENCES API
// ============================================

export interface UserPreferences {
    theme: 'light' | 'dark';
    default_chart_type: string;
    default_timeframe: string;
    notifications_enabled: boolean;
    email_alerts: boolean;
    watchlist_alerts: boolean;
}

export async function getPreferences() {
    return apiFetch<{ preferences: UserPreferences }>('/preferences');
}

export async function updatePreferences(preferences: Partial<UserPreferences>) {
    return apiFetch<{ preferences: UserPreferences }>('/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
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

export async function getNews(filter = 'latest') {
    return apiFetch<{ news: any[]; filter: string }>(`/news?filter=${filter}`);
}
