import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowLeft, Building2, BarChart3 } from 'lucide-react';
import { searchStocks } from '../lib/api';

interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
}

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function performSearch() {
            const q = searchParams.get('q');
            if (!q) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            const { data } = await searchStocks(q);
            if (data && data.results) {
                setResults(data.results);
            }
            setIsLoading(false);
        }
        performSearch();
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark pb-20 pt-24">
            {/* Sticky Search Header */}
            <div className="fixed top-[72px] left-0 right-0 z-40 border-b border-white/5 bg-brand-dark/80 backdrop-blur-md py-4">
                <div className="mx-auto max-w-7xl px-4">
                    <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for symbols, companies, or indices..."
                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-white/5"
                            autoFocus
                        />
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 mt-20">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Search Results</h1>
                        <p className="text-sm text-gray-500">
                            {isLoading ? 'Searching...' : `Found ${results.length} results for "${searchParams.get('q') || ''}"`}
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map((result) => {
                            const route = result.type.toLowerCase().includes('index') ? 'indices' : 'stocks';
                            return (
                                <Link
                                    key={result.symbol}
                                    to={`/${route}/${result.symbol}`}
                                    className="group flex items-center justify-between rounded-2xl border border-white/5 bg-gray-900/50 p-6 transition-all hover:border-white/10 hover:bg-white/5 hover:shadow-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all">
                                            {result.type.toLowerCase().includes('index') ? (
                                                <BarChart3 className="h-6 w-6 text-blue-400" />
                                            ) : (
                                                <Building2 className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white tracking-tight">{result.symbol}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-1.5 py-0.5 rounded border border-white/5 bg-white/5">
                                                    {result.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors">
                                                {result.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
                                            {result.exchange}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : searchParams.get('q') ? (
                    <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-600">
                            <Search className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                        <p className="text-gray-500 mx-auto max-w-xs">
                            We couldn't find anything matching "{searchParams.get('q')}". Try searching for symbols like AAPL or BTC.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-600">
                        Start typing to search markets
                    </div>
                )}
            </div>
        </div>
    );
}
