import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import IdeaCard from '../components/IdeaCard';
import { getIdeas, Idea } from '../lib/api';

export default function IdeasPage() {
  const filter = 'latest';
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIdeas() {
      setIsLoading(true);
      const { data } = await getIdeas(filter);
      if (data) {
        setIdeas(data.ideas);
      }
      setIsLoading(false);
    }
    loadIdeas();
  }, [filter]);

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

        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={{
                id: idea.id,
                title: idea.title,
                author: idea.author,
                time: idea.time,
                image: idea.image || 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
                likes: idea.likes,
                comments: idea.commentCount || 0
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
