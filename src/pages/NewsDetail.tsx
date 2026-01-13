import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { getNews } from '../lib/api';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    category: string;
    link?: string;
    thumbnail?: string;
    content?: string;
}

export default function NewsDetail() {
    const { id } = useParams<{ id: string }>();
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            setIsLoading(true);
            // Since we don't have a single news fetch by ID, we search in the latest list
            // In a real app, this would be a dedicated endpoint
            const { data } = await getNews('latest');
            if (data && data.news) {
                const found = data.news.find((n: NewsItem) => n.id === id);
                setNewsItem(found || null);
            }
            setIsLoading(false);
        }
        fetchNews();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-brand-dark">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-dark text-center">
                <h2 className="mb-4 text-2xl font-bold text-white">Article not found</h2>
                <Link to="/news" className="text-blue-500 hover:underline">Back to Market News</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark">
            <div className="border-b border-white/5 bg-gray-900/50 py-4">
                <div className="mx-auto max-w-7xl px-4">
                    <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to News
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-12">
                <article className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                            <Newspaper className="h-3.5 w-3.5" />
                            {newsItem.category}
                        </div>
                        <h1 className="text-3xl font-bold text-white md:text-5xl leading-tight">
                            {newsItem.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="font-bold text-white">{newsItem.source}</span>
                            <span>•</span>
                            <span>{newsItem.time}</span>
                        </div>
                    </div>

                    {newsItem.thumbnail && (
                        <div className="overflow-hidden rounded-2xl border border-white/5">
                            <img src={newsItem.thumbnail} alt={newsItem.title} className="w-full" />
                        </div>
                    )}

                    <div className="prose prose-invert max-w-none text-lg text-gray-300 leading-relaxed">
                        <p className="mb-6">
                            Financial markets are reacting to the latest developments as {newsItem.title.toLowerCase()}.
                            Analysts suggest that this trend could continue through the upcoming sessions, driven by
                            investor sentiment and macroeconomic factors.
                        </p>
                        <p className="mb-6">
                            While the full details of the movement are still emerging, the scale of market response
                            indicates a significant shift in expectations for the sector.
                        </p>

                        <div className="mt-12 rounded-2xl bg-white/5 p-8 border border-white/10 text-center">
                            <h3 className="mb-4 text-xl font-bold text-white">Read the full story</h3>
                            <p className="mb-6 text-gray-400">This article was originally published on {newsItem.source}. Click below to read the complete coverage on the original platform.</p>
                            <a
                                href={newsItem.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all hover:scale-105"
                            >
                                Continue reading on {newsItem.source}
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-8">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <Share2 className="h-5 w-5" />
                            <span className="font-medium">Share this article</span>
                        </button>
                        <div className="flex gap-2">
                            {['Market', 'Finance', 'Economy'].map(tag => (
                                <span key={tag} className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
