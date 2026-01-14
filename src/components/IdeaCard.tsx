import { Link } from 'react-router-dom';
// Removed icons
import { IdeaItem } from '../data/mockData';

interface IdeaCardProps {
  idea: IdeaItem;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link to={`/ideas/${idea.id}`} className="block">
      <div className="group overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
        <div className="aspect-video overflow-hidden">
          <img
            src={idea.image}
            alt={idea.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span className="text-blue-400">{idea.author}</span>
            <span className="h-1 w-1 rounded-full bg-gray-700" />
            <span>{new Date(idea.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 leading-snug">
            {idea.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
