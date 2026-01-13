import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
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
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>{idea.author}</span>
            <span>•</span>
            <span>{idea.time}</span>
          </div>
          <h3 className="mb-3 text-sm font-medium text-white group-hover:text-blue-400">
            {idea.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{idea.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{idea.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
