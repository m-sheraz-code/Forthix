import { useState } from 'react';
import IdeaCard from '../components/IdeaCard';
import { ideasItems } from '../data/mockData';

export default function IdeasPage() {
  const [filter, setFilter] = useState('editors');

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="border-b border-gray-800 bg-brand-dark py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-2 text-4xl font-bold text-white">Community Ideas</h1>
          <p className="text-gray-400">
            Trading ideas and analysis from our community of traders
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('editors')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === 'editors'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-700 text-gray-400 hover:text-white'
              }`}
          >
            Editors' picks
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === 'popular'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-700 text-gray-400 hover:text-white'
              }`}
          >
            Popular
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === 'recent'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-700 text-gray-400 hover:text-white'
              }`}
          >
            Recent
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideasItems.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    </div>
  );
}
