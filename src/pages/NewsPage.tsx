import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { getNews } from '../lib/api';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  publishedAt?: string;
}

export default function NewsPage() {
  const filter = 'latest';
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      setIsLoading(true);
      const { data } = await getNews(filter, 100);
      if (data) {
        setNews(data.news);
      }
      setIsLoading(false);
    }
    loadNews();
  }, [filter]);

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="border-b border-gray-800 bg-brand-dark py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-2 text-4xl font-bold text-white">Market News</h1>
          <p className="text-gray-400">
            Latest news and updates from global financial markets
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">

        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
