/**
 * Simple in-memory cache with TTL support
 * Used to reduce API calls to Yahoo Finance
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemoryCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();

    /**
     * Get a cached value
     * @param key Cache key
     * @returns Cached value or null if not found/expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set a cached value with TTL
     * @param key Cache key
     * @param data Data to cache
     * @param ttlSeconds Time to live in seconds
     */
    set<T>(key: string, data: T, ttlSeconds: number): void {
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    /**
     * Delete a cached value
     * @param key Cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cached values
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    stats(): { size: number; keys: string[] } {
        // Clean up expired entries
        const now = Date.now();
        this.cache.forEach((entry, key) => {
            if (now > (entry as any).expiresAt) {
                this.cache.delete(key);
            }
        });

        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    REALTIME: parseInt(process.env.YAHOO_CACHE_TTL_REALTIME || '300', 10), // 5 minutes default
    HISTORICAL: parseInt(process.env.YAHOO_CACHE_TTL_HISTORICAL || '1800', 10), // 30 minutes default
    SEARCH: 3600, // 1 hour for search
    NEWS: 600, // 10 minutes for news
};

/**
 * Wrapper function for caching async operations
 * @param key Cache key
 * @param ttlSeconds TTL in seconds
 * @param fetcher Async function to fetch data if not cached
 */
export async function withCache<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
): Promise<T> {
    // Try to get from cache
    const cached = cache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    cache.set(key, data, ttlSeconds);

    return data;
}
