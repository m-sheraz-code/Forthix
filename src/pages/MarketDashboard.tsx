import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import MarketCard from '../components/MarketCard';
import { majorIndices } from '../data/mockData';

export default function MarketDashboard() {
  const [activeTab, setActiveTab] = useState('indices');

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-950 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-2 text-4xl font-bold text-white">Markets</h1>
          <p className="text-gray-400">
            Track global indices, stocks, forex, crypto, and commodities
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('indices')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'indices'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Indices
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'stocks'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Stocks
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'crypto'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Crypto
          </button>
          <button
            onClick={() => setActiveTab('forex')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'forex'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Forex
          </button>
          <button
            onClick={() => setActiveTab('commodities')}
            className={`pb-3 text-sm font-medium ${
              activeTab === 'commodities'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Commodities
          </button>
        </div>

        {activeTab === 'indices' && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Global Indices</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {majorIndices.map((index) => (
                <MarketCard key={index.symbol} {...index} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stocks' && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Popular Stocks</h2>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">Stock market data coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'crypto' && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Cryptocurrency</h2>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">Crypto market data coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'forex' && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Forex Pairs</h2>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">Forex market data coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'commodities' && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Commodities</h2>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">Commodities market data coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
