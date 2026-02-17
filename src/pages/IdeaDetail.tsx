import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getIdea, getIdeas, Idea } from '../lib/api';

export default function IdeaDetail() {
    const { id } = useParams<{ id: string }>();
    const [idea, setIdea] = useState<Idea | null>(null);
    const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            setIsLoading(true);

            // Fetch current idea and list for navigation
            const [ideaRes, listRes] = await Promise.all([
                getIdea(id),
                getIdeas('latest')
            ]);

            let currentIdea = ideaRes.data?.idea || null;
            const ideasList = listRes.data?.ideas || [];

            // Fallback: if single fetch fails, find in list
            if (!currentIdea && ideasList.length > 0) {
                currentIdea = ideasList.find(i => i.id === id) || null;
                console.warn('Idea not found in single fetch, recovered from list');
            }

            setIdea(currentIdea);
            setAllIdeas(ideasList);

            setIsLoading(false);
            window.scrollTo(0, 0);
        }
        fetchData();
    }, [id]);

    const currentIndex = allIdeas.findIndex(i => i.id === id);
    const prevIdea = currentIndex > 0 ? allIdeas[currentIndex - 1] : null;
    const nextIdea = currentIndex < allIdeas.length - 1 ? allIdeas[currentIndex + 1] : null;

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
                <Link to="/ideas" className="text-blue-500 hover:underline inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Community Ideas
                </Link>
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

            <div className="mx-auto max-w-7xl px-4 py-12">
                {/* Title and Metadata - Always visible above image if present */}
                <div className="mb-8 border-b border-white/5 pb-8">
                    {idea.symbol && (
                        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                            <TrendingUp className="h-3 w-3" />
                            {idea.symbol}
                        </div>
                    )}
                    <h1 className="mb-6 text-3xl font-bold text-white md:text-5xl lg:text-6xl max-w-4xl leading-tight">
                        {idea.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 shadow-lg backdrop-blur-md">
                                {idea.author[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-white text-base">{idea.author}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="font-medium">{new Date(idea.created_at || idea.time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Hero Banner Style Design - Image Only */}
                {idea.image && (
                    <div className="mb-12 overflow-hidden rounded-3xl border border-white/5 shadow-2xl relative">
                        <img
                            src={idea.image}
                            alt={idea.title}
                            className="h-[300px] md:h-[500px] w-full object-cover"
                        />
                    </div>
                )}

                <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
                    <div className="space-y-12">
                        {/* Content */}
                        <div className="prose prose-invert max-w-none text-xl text-gray-300 leading-relaxed font-normal">
                            {idea.content ? (
                                idea.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-8">{line}</p>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No additional description provided for this idea.</p>
                            )}
                        </div>

                        {/* Sequential Navigation */}
                        <div className="flex flex-col gap-4 border-t border-white/5 pt-12 sm:flex-row sm:items-center sm:justify-between">
                            {prevIdea ? (
                                <Link
                                    to={`/ideas/${prevIdea.id}`}
                                    className="group flex flex-1 flex-col items-start gap-2 rounded-2xl border border-white/5 bg-gray-900/30 p-4 transition-all hover:bg-white/5 hover:border-gray-700"
                                >
                                    <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-blue-400">
                                        <ChevronLeft className="h-4 w-4" /> Previous Idea
                                    </span>
                                    <span className="line-clamp-1 font-bold text-white group-hover:text-blue-400">{prevIdea.title}</span>
                                </Link>
                            ) : <div className="flex-1" />}

                            <div className="hidden h-12 w-px bg-white/5 sm:block mx-4" />

                            {nextIdea ? (
                                <Link
                                    to={`/ideas/${nextIdea.id}`}
                                    className="group flex flex-1 flex-col items-end gap-2 rounded-2xl border border-white/5 bg-gray-900/30 p-4 text-right transition-all hover:bg-white/5 hover:border-gray-700"
                                >
                                    <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-blue-400">
                                        Next Idea <ChevronRight className="h-4 w-4" />
                                    </span>
                                    <span className="line-clamp-1 font-bold text-white group-hover:text-blue-400">{nextIdea.title}</span>
                                </Link>
                            ) : <div className="flex-1" />}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="rounded-3xl border border-white/5 bg-gray-900/30 p-8 backdrop-blur-sm">
                            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-blue-400">About the Author</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-bold border border-blue-500/10">
                                    {idea.author[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-xl">{idea.author}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Forthix Research Team</p>
                                </div>
                            </div>
                            <p className="text-base text-gray-400 leading-relaxed mb-6 font-medium">
                                Official market analysis and high-probability trading ideas from the Forthix editorial desk.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Strategy', 'Market Alpha', 'Trading'].map(tag => (
                                    <span key={tag} className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {idea.symbol && (
                            <div className="rounded-3xl border border-white/5 bg-gray-900/30 p-8 backdrop-blur-sm">
                                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-blue-400">Analysis Context</h3>
                                <Link
                                    to={`/indices/${idea.symbol}`}
                                    className="group flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">{idea.symbol}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Instrument Focus</span>
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <TrendingUp className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest italic group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        View real-time chart <ChevronRight className="h-3 w-3" />
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
