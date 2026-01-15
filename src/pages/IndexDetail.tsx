import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { TrendingUp, Maximize2, ChevronDown, Loader2 } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import { getIndexData, getStockData, getMarketSummary, Quote } from '../lib/api';
import SentimentMeter from '../components/SentimentMeter';

export default function IndexDetail() {
  const { symbol } = useParams();
  const location = useLocation();
  const isStock = location.pathname.includes('/stocks/');

  const [timeRange, setTimeRange] = useState('1m');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [indexData, setIndexData] = useState<(Quote & { chartData: any[] }) | null>(null);
  const [relatedIndices, setRelatedIndices] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const timeRanges = ['1d', '5d', '1m', '6m', 'ytd', '1y', '5y', 'max'];

  useEffect(() => {
    async function loadData() {
      if (!symbol) return;
      setIsLoading(true);
      const fetchFn = isStock ? getStockData : getIndexData;
      const [indexResult, marketResult] = await Promise.all([
        fetchFn(symbol, timeRange),
        getMarketSummary()
      ]);

      if (indexResult.data) {
        setIndexData(indexResult.data);
      } else {
        console.error(`Failed to fetch ${isStock ? 'stock' : 'index'} data:`, indexResult.error);
      }

      if (marketResult.data) {
        // Filter out current symbol from related indices
        setRelatedIndices(marketResult.data.indices.filter(idx => idx.symbol !== symbol));
      }
      setIsLoading(false);
    }
    loadData();
  }, [symbol, timeRange, isStock]);

  const data = indexData || {
    symbol: symbol || 'SPX',
    name: symbol === '000001.SS' ? 'SSE Composite Index' : symbol || 'Loading...',
    price: 0,
    change: 0,
    changePercent: 0,
    open: 0,
    previousClose: 0,
    volume: 0,
    exchange: isStock ? 'Market' : 'Index',
    chartData: []
  };

  const isPositive = data.change >= 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-brand-dark">
      <div className="border-b border-white/5 bg-brand-dark py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
            <Link to="/markets" className="hover:text-white transition-colors">Markets</Link>
            <span>/</span>
            <span>{isStock ? 'Stocks' : 'Indices'}</span>
            <span>/</span>
            <span className="text-white font-medium">{symbol}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{data.name}</h1>
                <p className="text-sm font-medium text-gray-500">
                  {symbol} • {data.exchange} • {isStock ? 'Stock' : 'Index'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-4">
            <div>
              <p className="text-5xl font-bold text-white tracking-tight">
                {isLoading ? '...' : data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{data.change.toFixed(2)} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
                </span>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-4 sm:p-6 shadow-2xl backdrop-blur-xl mb-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase transition-all ${timeRange === range
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <Link
                  to={`/chart/${symbol}`}
                  className="rounded-xl bg-white/5 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-x-scroll scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="h-[400px] sm:h-[450px] min-w-[600px] sm:min-w-0 relative transition-opacity duration-300" style={{ opacity: isLoading ? 0.3 : 1 }}>
                  <PriceChart data={data.chartData} isPositive={isPositive} />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                { label: 'Prev Close', value: data.previousClose?.toLocaleString() || '--' },
                { label: 'Open', value: data.open?.toLocaleString() || '--' },
                { label: 'Volume', value: data.volume?.toLocaleString() || '--' },
                { label: 'Exchange', value: data.exchange || '--' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-gray-900/50 p-5 transition-all hover:border-white/10 group">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-12">
              <h3 className="mb-8 text-xl font-bold text-white flex items-center gap-4">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                Market Analysis
                <div className="h-px flex-1 bg-white/5" />
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-8 shadow-xl hover:bg-white/[0.02] transition-all group">
                  <h4 className="mb-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-blue-400 transition-colors">Oscillators</h4>
                  <SentimentMeter type="buy" label="Neutral Trend" />
                </div>

                <div className="rounded-3xl border border-red-500/20 bg-gray-900/50 p-8 shadow-2xl shadow-red-500/5 ring-1 ring-red-500/10 hover:bg-white/[0.02] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-12 w-12 text-red-500 rotate-180" />
                  </div>
                  <h4 className="mb-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-colors">Summary</h4>
                  <SentimentMeter type="strong-sell" label="Strong Resistance" />
                </div>

                <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-8 shadow-xl hover:bg-white/[0.02] transition-all group">
                  <h4 className="mb-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-red-400 transition-colors">Moving Averages</h4>
                  <SentimentMeter type="sell" label="Bearish Cross" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-white">About {data.name}</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Live market data for {data.name} ({symbol}). This index/stock is part of the global trading market.
                Keep track of performance, volume, and real-time updates through Forthix's advanced charting system.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-white">Related Markets</h3>
              <div className="space-y-3">
                {relatedIndices.slice(0, 4).map((idx: Quote) => (
                  <Link
                    key={idx.symbol}
                    to={`/indices/${idx.symbol}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold text-white uppercase">{idx.symbol}</p>
                      <p className="text-xs text-gray-500">{idx.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${idx.price.toLocaleString()}</p>
                      <p className={`text-[10px] font-bold ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gray-900/50 p-6 shadow-xl">
              <h3 className="mb-6 text-lg font-bold text-white">FAQ</h3>
              <div className="space-y-3">
                {[
                  {
                    q: `What is ${data.name} price today?`,
                    a: `${data.name} is currently trading at ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}. The market is showing a ${isPositive ? 'bullish' : 'bearish'} trend.`
                  },
                  {
                    q: 'Is it a good time to buy?',
                    a: 'Our technical analysis indicators are currently suggesting a sell signal for the short term based on moving averages. Always perform your own research.'
                  }
                ].map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="text-xs font-bold text-white pr-4">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`px-4 pb-4 text-xs leading-loose text-gray-500 transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                    >
                      <p className="pt-2 border-t border-white/5">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
