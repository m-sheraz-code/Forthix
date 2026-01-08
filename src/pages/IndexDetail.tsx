import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, Maximize2, ChevronDown } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import IdeaCard from '../components/IdeaCard';
import NewsCard from '../components/NewsCard';
import { sseCompositeData, ideasItems, newsItems } from '../data/mockData';

export default function IndexDetail() {
  const { symbol } = useParams();
  const [timeRange, setTimeRange] = useState('1M');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const timeRanges = ['1 day', '5 days', '1 month', '6 months', 'YTD', '1 year', '5 years', 'All time'];
  const timeRangeMap: Record<string, string> = {
    '1 day': '1D',
    '5 days': '5D',
    '1 month': '1M',
    '6 months': '6M',
    YTD: 'YTD',
    '1 year': '1Y',
    '5 years': '5Y',
    'All time': 'MAX',
  };

  const data = sseCompositeData;
  const isPositive = data.change >= 0;

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="border-b border-gray-800 bg-brand-dark py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
            <Link to="/markets" className="hover:text-white">
              Markets
            </Link>
            <span>/</span>
            <Link to="/markets" className="hover:text-white">
              Markets/China
            </Link>
            <span>/</span>
            <span>Indices</span>
            <span>/</span>
            <span className="text-white">{symbol}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-teal-600">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{data.name}</h1>
                <p className="text-sm text-gray-400">
                  {symbol} • {data.exchange} •
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-white">
                {data.price.toLocaleString('en-US', { minimumFractionDigits: 4 })}
              </p>
              <p className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}
                {data.change.toFixed(4)} {isPositive ? '+' : ''}
                {data.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-6 flex gap-6 border-b border-gray-800">
          <button className="border-b-2 border-blue-500 pb-3 text-sm font-medium text-white">
            Overview
          </button>
          <button className="pb-3 text-sm text-gray-400 hover:text-white">News</button>
          <button className="pb-3 text-sm text-gray-400 hover:text-white">Ideas</button>
          <button className="pb-3 text-sm text-gray-400 hover:text-white">Models</button>
          <button className="pb-3 text-sm text-gray-400 hover:text-white">Technicals</button>
          <button className="pb-3 text-sm text-gray-400 hover:text-white">Seasonals</button>
          <button className="pb-3 text-sm text-gray-400 hover:text-white">Components</button>
        </nav>

        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Chart</h2>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-white">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(timeRangeMap[range])}
                    className={`rounded px-3 py-1.5 text-xs font-medium ${timeRange === timeRangeMap[range]
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <span className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
                Full market
              </span>
            </div>

            <div className="h-96">
              <PriceChart data={data.chartData} isPositive={isPositive} />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Key data points</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-400">Volume</p>
              <p className="text-xl font-semibold text-white">
                {data.volume.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Previous Close</p>
              <p className="text-xl font-semibold text-white">
                {data.previousClose.toLocaleString('en-US', { minimumFractionDigits: 4 })} CNY
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Open</p>
              <p className="text-xl font-semibold text-white">
                {data.open.toLocaleString('en-US', { minimumFractionDigits: 4 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Day's range</p>
              <p className="text-xl font-semibold text-white">
                {data.dayRange.low.toLocaleString('en-US', { minimumFractionDigits: 4 })} —{' '}
                {data.dayRange.high.toLocaleString('en-US', { minimumFractionDigits: 4 })}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">About SSE Composite Index</h3>
          <p className="text-sm leading-relaxed text-gray-300">
            The SSE Composite Index, also referred to as the Shanghai Index, is a stock market index
            that tracks the performance of all stocks listed on the Shanghai Stock Exchange. First introduced in
            1991, it is a key indicator of market performance in China. <span className="text-blue-400 cursor-pointer hover:underline">Show more</span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Related indices</h3>
          <div className="grid gap-4 md:grid-cols-4">
            {data.relatedIndices.map((index) => (
              <Link
                key={index.symbol}
                to={`/indices/${index.symbol}`}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-800">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-400">{index.symbol}</p>
                </div>
                <h4 className="mb-2 text-sm font-medium text-white">{index.name}</h4>
                <p className="text-lg font-semibold text-white">
                  {index.price.toLocaleString('en-US', { minimumFractionDigits: 4 })}
                </p>
                <p className={`text-sm ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {index.change >= 0 ? '+' : ''}
                  {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-white">News</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {newsItems.slice(0, 2).map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/news" className="text-sm text-blue-400 hover:underline">
              Keep reading →
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Ideas</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {ideasItems.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Technicals</h3>
          <p className="mb-4 text-sm text-gray-400">Summarizing what the indicators are suggesting</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h4 className="mb-4 text-center text-sm font-semibold text-white">Oscillators</h4>
              <div className="mb-4 flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="188.5"
                      strokeDashoffset="62.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">Buy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h4 className="mb-4 text-center text-sm font-semibold text-white">Summary</h4>
              <div className="mb-4 flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#ef4444"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="188.5"
                      strokeDashoffset="31.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
                    <span className="text-sm font-bold leading-tight text-red-500">Strong Sell</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h4 className="mb-4 text-center text-sm font-semibold text-white">Moving Averages</h4>
              <div className="mb-4 flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#ef4444"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="188.5"
                      strokeDashoffset="62.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-red-400">Sell</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: `What is SSE Composite Index value today?`,
                a: `The SSE Composite Index is currently trading at ${data.price.toLocaleString('en-US', { minimumFractionDigits: 4 })}. The market is showing a ${data.change >= 0 ? 'positive' : 'negative'} trend with a ${data.changePercent.toFixed(2)}% change today.`
              },
              {
                q: `What is SSE Composite Index highest value ever?`,
                a: `The SSE Composite Index reached its historical all-time high of 6,124.04 points on October 16, 2007, during a massive bull run in the Chinese markets.`
              },
              {
                q: `What is SSE Composite Index lowest value ever?`,
                a: `Since its inception in 1990, the index's all-time low was approximately 95.79 points, recorded on December 19, 1990.`
              },
              {
                q: `What are the largest SSE Composite Index companies?`,
                a: `The index is weighted by market capitalization and includes giants like Kweichow Moutai, ICBC (Industrial and Commercial Bank of China), PetroChina, and Agricultural Bank of China.`
              },
              {
                q: `How to invest in SSE Composite Index?`,
                a: `Investors can gain exposure through index-tracking ETFs, mutual funds, or by trading index futures. Many international brokers offer access to Chinese A-shares through Stock Connect programs.`
              }
            ].map((faq, index) => (
              <div key={index} className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden transition-all hover:border-gray-700">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`px-4 pb-4 text-sm text-gray-400 transition-all duration-300 ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    } border-t border-gray-800/50 mt-[-1px]`}
                >
                  <div className="pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
