import { Clock } from 'lucide-react';
import { NewsItem } from '../data/mockData';

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="group rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700">
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
        <span className="rounded bg-gray-800 px-2 py-1">{news.source}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {news.time}
        </span>
      </div>
      <h3 className="text-sm font-medium text-white group-hover:text-blue-400">
        {news.title}
      </h3>
    </div>
  );
}
