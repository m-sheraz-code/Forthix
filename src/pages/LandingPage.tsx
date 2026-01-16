import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, ArrowRight, Loader2, Plus } from 'lucide-react';
import MiniChart from '../components/MiniChart';

import IdeaCard from '../components/IdeaCard';
import NewsCard from '../components/NewsCard';
import { getMarketSummary, MarketSummary, getIdeas, getNews, Idea, searchStocks } from '../lib/api';


interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  publishedAt?: string;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<MarketSummary | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleStocksCount, setVisibleStocksCount] = useState(4);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const [marketResult, ideasResult, newsResult] = await Promise.all([
        getMarketSummary(),
        getIdeas('editors'),
        getNews('latest')
      ]);

      if (marketResult.data) {
        setMarketData(marketResult.data);
      }
      if (ideasResult.data) {
        setIdeas(ideasResult.data.ideas);
      }
      if (newsResult.data) {
        setNews(newsResult.data.news);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const result = await searchStocks(searchQuery);
        if (result.data) {
          setSuggestions(result.data.results);
          setShowSuggestions(true);
        }
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const featuredIndex = marketData?.indices[0] || null;

  return (
    <div className="bg-brand-dark">
      <section className="relative min-h-[100vh] flex items-center justify-center border-b border-white/5 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-brand-dark to-brand-dark" />
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[url('https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg')] bg-cover bg-center" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-4xl lg:text-8xl leading-[1.1]">
              Insight first. <br className="hidden md:block" />
              Then action.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-base text-gray-400 md:text-xl md:leading-relaxed">
              The world's most advanced trading platform and social network <br className="hidden md:block" />
              for traders and investors.
            </p>

            <div className="mx-auto max-w-xl relative group px-2 z-50" ref={searchRef}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setShowSuggestions(false);
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  placeholder="Search markets, stocks, or news..."
                  className="w-full rounded-2xl bg-white/5 border border-white/10 py-3.5 px-6 pl-14 text-white placeholder-gray-500 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all shadow-2xl"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <Search className="h-5 w-5 group-focus-within:text-white transition-colors" />
                  )}
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && (searchQuery.trim().length > 0) && (
                <div className="absolute left-2 right-2 top-full mt-2 rounded-2xl border border-white/10 bg-gray-900/80 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="max-h-[480px] overflow-y-auto">
                    {isSearching && (
                      <div className="p-4 text-center text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
                        <p className="text-sm">Searching markets...</p>
                      </div>
                    )}

                    {!isSearching && suggestions.length === 0 && (
                      <div className="p-4 text-center text-gray-400">
                        <p className="text-sm">No results found for "{searchQuery}"</p>
                      </div>
                    )}

                    {!isSearching && suggestions.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          navigate(`/indices/${item.symbol}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:bg-white/10 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{item.symbol}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{item.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.exchange}</p>
                          <div className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold">VIEW</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 bg-brand-dark py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Market summary
              <ArrowRight className="h-5 w-5" />
            </h2>
          </div>

          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Featured Index Card */}
                {featuredIndex && (
                  <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 overflow-hidden relative">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{featuredIndex.symbol}</p>
                        <h3 className="text-xl font-semibold text-white">{featuredIndex.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {featuredIndex.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm ${featuredIndex.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {featuredIndex.change >= 0 ? '+' : ''}{featuredIndex.change.toFixed(2)} ({featuredIndex.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <div className="h-48 mt-8">
                      <MiniChart data={featuredIndex.chartData || []} isPositive={featuredIndex.change >= 0} />
                    </div>
                  </div>
                )}

                {/* Major Indices List */}
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Major Indices</h3>
                  <div className="space-y-3">
                    {(marketData?.indices || []).slice(1, 5).map((index) => (
                      <Link
                        key={index.symbol}
                        to={`/indices/${index.symbol}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3.5 transition-all hover:bg-white/10 hover:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{index.symbol}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{index.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            {index.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className={`text-xs font-medium ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/markets"
                    className="mt-6 block text-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    See all major markets →
                  </Link>
                </div>
              </div>

              {/* Market Stats Grid */}
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Market Breadth</h4>
                  <p className="text-2xl font-bold text-white">Mixed</p>
                  <div className="mt-4 flex h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div className="bg-green-500 w-[45%]" />
                    <div className="bg-gray-700 w-[10%]" />
                    <div className="bg-red-500 w-[45%]" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-bold">
                    <span>ADVANCE: 1,240</span>
                    <span>DECLINE: 1,310</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Dollar Index (DXY)</h4>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {marketData?.summary.dollarIndex.toFixed(3) || '106.820'}
                      </p>
                      <p className={`text-sm font-bold ${marketData?.summary.dollarIndexChange! >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {marketData?.summary.dollarIndexChange! >= 0 ? '+' : ''}
                        {marketData?.summary.dollarIndexChange?.toFixed(2) || '0.12'}%
                      </p>
                    </div>
                    <div className="h-10 w-24">
                      {/* Mini visual indicator */}
                      <div className="flex h-full items-end gap-1">
                        {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">10Y Treasury Yield</h4>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {marketData?.summary.us10Year.toFixed(3) || '4.417'}
                      </p>
                      <p className={`text-sm font-bold ${marketData?.summary.us10YearChange! >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {marketData?.summary.us10YearChange! >= 0 ? '+' : ''}
                        {marketData?.summary.us10YearChange?.toFixed(2) || '0.05'}%
                      </p>
                    </div>
                    <div className="h-10 w-24">
                      <div className="flex h-full items-end gap-1">
                        {[30, 50, 40, 20, 60, 40, 50].map((h, i) => (
                          <div key={i} className="flex-1 bg-orange-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-b border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Community ideas
              <ArrowRight className="h-5 w-5" />
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={{
                id: idea.id,
                title: idea.title,
                author: idea.author,
                time: idea.time,
                image: idea.image || 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
                likes: idea.likes,
                comments: idea.commentCount || 0
              }} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Top stories
              <ArrowRight className="h-5 w-5" />
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 6).map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/news"
              className="text-sm text-blue-400 hover:underline"
            >
              Keep reading →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
              US stocks
              <ArrowRight className="h-5 w-5" />
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Most Active</h3>
              <div className="space-y-3">
                {(marketData?.movers.mostActive || []).slice(0, visibleStocksCount).map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/indices/${stock.symbol}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-900/50 p-3.5 transition-all hover:bg-white/5 hover:border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${stock.price.toFixed(2)}</p>
                      <p className={`text-xs font-bold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Top Gainers</h3>
              <div className="space-y-3">
                {(marketData?.movers.gainers || []).slice(0, visibleStocksCount).map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/indices/${stock.symbol}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-900/50 p-3.5 transition-all hover:bg-white/5 hover:border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${stock.price.toFixed(2)}</p>
                      <p className="text-xs font-bold text-green-500">+{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Top Losers</h3>
              <div className="space-y-3">
                {(marketData?.movers.losers || []).slice(0, visibleStocksCount).map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/indices/${stock.symbol}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-900/50 p-3.5 transition-all hover:bg-white/5 hover:border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${stock.price.toFixed(2)}</p>
                      <p className="text-xs font-bold text-red-500">{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            {marketData && (
              (marketData.movers.mostActive.length > visibleStocksCount) ||
              (marketData.movers.gainers.length > visibleStocksCount) ||
              (marketData.movers.losers.length > visibleStocksCount)
            ) && (
                <button
                  onClick={() => setVisibleStocksCount(prev => prev + 4)}
                  className="group relative flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  <Plus className="h-4 w-4 text-blue-500 transition-transform group-hover:rotate-90" />
                  Load More Stocks
                </button>
              )}

            <div className="text-center">
              <Link
                to="/markets"
                className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                See all trending stocks →
              </Link>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-gradient-to-b from-brand-dark to-gray-900 py-24 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            INSIGHT FIRST / THEN ACTION.
          </h2>
          <p className="mb-8 text-lg text-gray-300">
            Great minds think differently, the best trades require
          </p>
          <Link
            to="/markets"
            className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-gray-950 transition-colors hover:bg-gray-100"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
