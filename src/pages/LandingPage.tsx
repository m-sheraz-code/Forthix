import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowRight, TrendingUp, ChevronDown } from 'lucide-react';
import MarketCard from '../components/MarketCard';
import IdeaCard from '../components/IdeaCard';
import NewsCard from '../components/NewsCard';
import MiniChart from '../components/MiniChart';
import { majorIndices, ideasItems, newsItems, topStocks, brokers } from '../data/mockData';

const generateVolatileData = (points: number, base: number, volatility: number) => {
  const data = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    // Random walk with a slight bias towards the base to keep it in range
    const drift = (base - current) * 0.1;
    const change = (Math.random() - 0.5) * volatility + drift;
    current += change;
    data.push({ time: i.toString(), value: current });
  }
  return data;
};

export default function LandingPage() {
  const spxData = majorIndices[0];

  const spxVolatileData = useMemo(() => generateVolatileData(60, spxData.price, 80), [spxData.price]);
  const crudeVolatileData = useMemo(() => generateVolatileData(30, 3.81, 0.15), []);
  const usdVolatileData = useMemo(() => generateVolatileData(30, 100.236, 1.2), []);
  const yieldVolatileData = useMemo(() => generateVolatileData(30, 4.170, 0.08), []);

  return (
    <div className="bg-brand-dark">
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden border-b border-white/5">
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

            <div className="mx-auto max-w-xl relative group px-2">
              <input
                type="text"
                placeholder="Search markets, stocks, or news..."
                className="w-full rounded-2xl bg-white/5 border border-white/10 py-3.5 px-6 pl-14 text-white placeholder-gray-500 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all shadow-2xl"
              />
              <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
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
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{spxData.symbol}</p>
                  <h3 className="text-xl font-semibold text-white">{spxData.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {spxData.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm ${spxData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    +{spxData.change.toFixed(2)} ({spxData.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
              <div className="h-48">
                <MiniChart data={spxVolatileData} isPositive={spxData.change >= 0} />
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Major Indices</h3>
              <div className="space-y-3">
                {majorIndices.slice(1).map((index) => (
                  <Link
                    key={index.symbol}
                    to={`/indices/${index.symbol}`}
                    className="flex items-center justify-between rounded-lg border border-gray-800 p-3 transition-colors hover:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{index.name}</p>
                        <p className="text-xs text-gray-400">{index.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {index.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/markets"
                className="mt-4 block text-center text-sm text-blue-400 hover:underline"
              >
                See all major markets →
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">Crude market cap</h4>
              <p className="text-2xl font-bold text-white">3.81T</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
                <span>+2.84%</span>
                <div className="h-12 flex-1">
                  <MiniChart
                    data={crudeVolatileData}
                    isPositive={true}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">US Dollar Index</h4>
              <p className="text-2xl font-bold text-white">100.236</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                <span>-0.81%</span>
                <div className="h-12 flex-1">
                  <MiniChart
                    data={usdVolatileData}
                    isPositive={false}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">US 10-year yield</h4>
              <p className="text-2xl font-bold text-white">4.170</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
                <span>+1.93%</span>
                <div className="h-12 flex-1">
                  <MiniChart
                    data={yieldVolatileData}
                    isPositive={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
              Community ideas
              <ArrowRight className="h-5 w-5" />
            </h2>
            <div className="flex gap-2">
              <button className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white">
                Editors' picks
              </button>
              <button className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white">
                Popular
              </button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideasItems.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
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
            {newsItems.slice(0, 6).map((news) => (
              <NewsCard key={news.id} news={news} />
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
              <h3 className="mb-4 text-sm font-semibold text-white">Highest volume stocks</h3>
              <div className="space-y-3">
                {topStocks.highestVolume.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${stock.price}</p>
                      <p className={`text-xs ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        +{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/markets"
                className="mt-4 block text-center text-sm text-blue-400 hover:underline"
              >
                See all trends traded stocks →
              </Link>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Stock gainers</h3>
              <div className="space-y-3">
                {topStocks.gainers.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${stock.price}</p>
                      <p className="text-xs text-green-500">+{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/markets"
                className="mt-4 block text-center text-sm text-blue-400 hover:underline"
              >
                See all stocks with largest gains →
              </Link>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Stock losers</h3>
              <div className="space-y-3">
                {topStocks.losers.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${stock.price}</p>
                      <p className="text-xs text-red-500">{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/markets"
                className="mt-4 block text-center text-sm text-blue-400 hover:underline"
              >
                See all stocks and year the firm →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-white">
              Trading and brokers
              <ArrowRight className="h-5 w-5" />
            </h2>
            <p className="text-sm text-gray-400">
              Trade directly on NASDAQ through our supported, fully-verified, and user-reviewed brokers.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {brokers.map((broker) => (
              <div
                key={broker.id}
                className="rounded-lg border border-gray-800 bg-gray-900 p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                    <span className="text-sm font-bold text-white">{broker.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{broker.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>⭐ {broker.rating}</span>
                      <span>•</span>
                      <span>{broker.reviews.toLocaleString()} reviews</span>
                    </div>
                  </div>
                </div>
                <button className="w-full rounded-lg bg-white py-2 text-sm font-medium text-gray-950 hover:bg-gray-100">
                  Open account
                </button>
              </div>
            ))}
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
