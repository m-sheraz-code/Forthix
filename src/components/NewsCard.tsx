import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface NewsCardProps {
  news: {
    id: string;
    title: string;
    source: string;
    time: string;
    category?: string;
    thumbnail?: string;
    link?: string;
    publishedAt?: string;
  };
}

export default function NewsCard({ news }: NewsCardProps) {
  const fallbackImage = 'https://images.pexels.com/photos/6770609/pexels-photo-6770609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  return (
    <Link to={`/news/${news.id}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gray-900/40 transition-all hover:border-blue-500/30 hover:bg-gray-900/60 hover:shadow-2xl hover:shadow-blue-500/10">
        {/* Image Container */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={news.thumbnail || fallbackImage}
            alt={news.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
          {news.category && (
            <div className="absolute left-4 top-4 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md border border-white/10">
              {news.category}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span className="text-blue-400">{news.source}</span>
            <span className="h-1 w-1 rounded-full bg-gray-700" />
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(news.publishedAt || news.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h3 className="line-clamp-3 text-base font-bold text-white transition-colors group-hover:text-blue-400 leading-snug">
            {news.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
