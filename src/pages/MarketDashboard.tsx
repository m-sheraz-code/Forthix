import { useState, useEffect } from 'react';
import { Loader2, ArrowUpRight, ArrowDownRight, Plus, Globe, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import MiniChart from '../components/MiniChart';
import { getMarketSummary, MarketSummary, Quote } from '../lib/api';

const generateVolatileData = (points: number, base: number, volatility: number) => {
  const data = [];
  let current = base;
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    const timeStr = time.toISOString();
    const drift = (base - current) * 0.1;
    const change = (Math.random() - 0.5) * volatility + drift;
    current += change;
    data.push({ time: timeStr, value: current });
  }
  return data;
};

export default function MarketDashboard() {
  const [activeTab, setActiveTab] = useState('indices');
  const [marketData, setMarketData] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleIndicesCount, setVisibleIndicesCount] = useState(9);
  const [visibleStocksCount, setVisibleStocksCount] = useState(5);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data } = await getMarketSummary();
      if (data) {
        setMarketData(data);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleLoadMore = () => {
    setVisibleIndicesCount((prev) => prev + 3);
  };

  const handleLoadMoreStocks = () => {
    setVisibleStocksCount((prev) => prev + 5);
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="border-b border-white/5 bg-brand-dark py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-3 text-5xl font-bold text-white tracking-tight">Market Outlook</h1>
          <p className="text-gray-500 text-lg font-medium">
            Top US stock market indicators, real-time analytics and performance tracking.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-10 flex gap-4 border-b border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'indices', label: 'US Indicators', icon: Globe },
            { id: 'stocks', label: 'US Stocks', icon: BarChart2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-3 pb-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap px-2 ${activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <tab.icon className={`h-4 w-4 transition-colors ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-600 group-hover:text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'indices' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Top US Stock Market Indicators</h2>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full">
                    Real-time
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(marketData?.indices || []).slice(0, visibleIndicesCount).map((index: Quote) => (
                    <Link key={index.symbol} to={`/indices/${index.symbol}`} className="block group">
                      <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-6 transition-all hover:bg-white/5 hover:border-white/10 hover:shadow-2xl">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">{index.symbol}</p>
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{index.name}</h3>
                          </div>
                          <div className={`rounded-xl p-2 bg-white/5 ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {index.change >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">{index.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p className={`text-sm font-bold mt-1 ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                            </p>
                          </div>
                          <div className="h-12 w-28 opacity-80">
                            <MiniChart
                              data={index.chartData || generateVolatileData(20, index.price, 10)}
                              isPositive={index.change >= 0}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {marketData && marketData.indices.length > visibleIndicesCount && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="group relative flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                    >
                      <Plus className="h-4 w-4 text-blue-500 transition-transform group-hover:rotate-90" />
                      Load More Indices
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stocks' && (
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-white tracking-tight">Market Gainers</h2>
                  <div className="space-y-3">
                    {marketData?.movers.gainers.slice(0, visibleStocksCount).map((stock: Quote) => (
                      <Link
                        key={stock.symbol}
                        to={`/indices/${stock.symbol}`}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-gray-900/50 p-4 transition-all hover:bg-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">
                            {stock.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{stock.symbol}</p>
                            <p className="text-xs text-gray-500">{stock.name}</p>
                          </div>
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
                  <h2 className="mb-6 text-2xl font-bold text-white tracking-tight">Most Active</h2>
                  <div className="space-y-3">
                    {marketData?.movers.mostActive.slice(0, visibleStocksCount).map((stock: Quote) => (
                      <Link
                        key={stock.symbol}
                        to={`/indices/${stock.symbol}`}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-gray-900/50 p-4 transition-all hover:bg-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                            {stock.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{stock.symbol}</p>
                            <p className="text-xs text-gray-500">{stock.name}</p>
                          </div>
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

                {marketData && (marketData.movers.gainers.length > visibleStocksCount || marketData.movers.mostActive.length > visibleStocksCount) && (
                  <div className="col-span-full mt-12 flex justify-center">
                    <button
                      onClick={handleLoadMoreStocks}
                      className="group relative flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                    >
                      <Plus className="h-4 w-4 text-blue-500 transition-transform group-hover:rotate-90" />
                      Load More Stocks
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
