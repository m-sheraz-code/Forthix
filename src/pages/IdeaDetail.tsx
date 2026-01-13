import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { getIdea, Idea } from '../lib/api';

export default function IdeaDetail() {
    const { id } = useParams<{ id: string }>();
    const [idea, setIdea] = useState<Idea | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        async function fetchIdea() {
            if (!id) return;
            setIsLoading(true);
            const { data } = await getIdea(id);
            if (data) {
                setIdea(data.idea);
            }
            setIsLoading(false);
        }
        fetchIdea();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-brand-dark">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-dark text-center">
                <h2 className="mb-4 text-2xl font-bold text-white">Idea not found</h2>
                <Link to="/ideas" className="text-blue-500 hover:underline">Back to Community Ideas</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark">
            <div className="border-b border-white/5 bg-gray-900/50 py-4">
                <div className="mx-auto max-w-7xl px-4">
                    <Link to="/ideas" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Ideas
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">{idea.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                        {idea.authorAvatar ? (
                                            <img src={idea.authorAvatar} alt={idea.author} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            idea.author[0].toUpperCase()
                                        )}
                                    </div>
                                    <span className="font-medium text-white">{idea.author}</span>
                                </div>
                                <span>•</span>
                                <span>{idea.time}</span>
                                {idea.symbol && (
                                    <>
                                        <span>•</span>
                                        <Link to={`/indices/${idea.symbol}`} className="flex items-center gap-1.5 text-blue-400 font-bold hover:bg-blue-500/10 px-2 py-0.5 rounded-md transition-colors">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            {idea.symbol}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Featured Image */}
                        {idea.image && (
                            <div className="overflow-hidden rounded-2xl border border-white/5">
                                <img src={idea.image} alt={idea.title} className="w-full object-cover" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                            {idea.content ? (
                                idea.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-4">{line}</p>
                                ))
                            ) : (
                                <p>No additional description provided for this idea.</p>
                            )}
                        </div>

                        {/* Interactions */}
                        <div className="flex items-center gap-6 border-y border-white/5 py-6">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`flex items-center gap-2.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="font-medium">{idea.likes + (isLiked ? 1 : 0)}</span>
                            </button>
                            <button className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors">
                                <MessageCircle className="h-6 w-6" />
                                <span className="font-medium">{idea.commentCount || 0}</span>
                            </button>
                            <button className="ml-auto flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors">
                                <Share2 className="h-5 w-5" />
                                <span className="font-medium">Share</span>
                            </button>
                        </div>

                        {/* Comments Placeholder */}
                        <div className="space-y-6 pt-4">
                            <h3 className="text-xl font-bold text-white">Comments ({idea.commentCount || 0})</h3>
                            <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                                <textarea
                                    placeholder="Share your thoughts on this idea..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 min-h-[100px] resize-none"
                                />
                                <div className="mt-2 flex justify-end">
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/5 bg-gray-900/30 p-5">
                            <h3 className="mb-4 font-bold text-white">About the Author</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold">
                                    {idea.author[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{idea.author}</p>
                                    <p className="text-xs text-gray-500">Pro Trader • 12.4k followers</p>
                                </div>
                            </div>
                            <button className="w-full rounded-xl bg-white/10 py-2 text-sm font-bold text-white hover:bg-white/20 transition-colors">
                                Follow
                            </button>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-gray-900/30 p-5">
                            <h3 className="mb-4 font-bold text-white">Related Symbols</h3>
                            <div className="space-y-3">
                                {['SPX', 'NDX', 'TSLA'].map(sym => (
                                    <Link
                                        key={sym}
                                        to={`/indices/${sym}`}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all grayscale hover:grayscale-0"
                                    >
                                        <span className="font-bold text-white">{sym}</span>
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
