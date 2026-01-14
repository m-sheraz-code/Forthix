import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Newspaper } from 'lucide-react';
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
    publishedAt?: string;
}

export default function NewsDetail() {
    const { id } = useParams<{ id: string }>();
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [allNews, setAllNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            setIsLoading(true);
            const { data } = await getNews('latest');
            if (data && data.news) {
                setAllNews(data.news);
                const found = data.news.find((n: NewsItem) => n.id === id);
                setNewsItem(found || null);
            }
            setIsLoading(false);
        }
        fetchNews();
    }, [id]);

    const currentIndex = allNews.findIndex(n => n.id === id);
    const prevNews = currentIndex > 0 ? allNews[currentIndex - 1] : null;
    const nextNews = currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;

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
                    <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Back to News
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12">
                <article className="space-y-12">
                    {/* Header Info */}
                    <div className="max-w-4xl space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                            <Newspaper className="h-3.5 w-3.5" />
                            {newsItem.category || 'Market News'}
                        </div>
                        <h1 className="text-3xl font-bold text-white md:text-5xl lg:text-6xl leading-[1.2] tracking-tight">
                            {newsItem.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                                {newsItem.source.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-white">{newsItem.source}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-700" />
                            <span>{new Date(newsItem.publishedAt || newsItem.time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {/* Hero Image */}
                    {newsItem.thumbnail && (
                        <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
                            <img
                                src={newsItem.thumbnail}
                                alt={newsItem.title}
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 prose prose-invert max-w-none text-lg text-gray-300 leading-relaxed">
                            {newsItem.content ? (
                                <div className="whitespace-pre-wrap space-y-6">{newsItem.content}</div>
                            ) : (
                                <div className="space-y-6">
                                    <p>
                                        Financial markets are reacting to the latest developments as {newsItem.title.toLowerCase()}.
                                        Analysts suggest that this trend could continue through the upcoming sessions, driven by
                                        investor sentiment and macroeconomic factors.
                                    </p>
                                    <p>
                                        While the full details of the movement are still emerging, the scale of market response
                                        indicates a significant shift in expectations for the sector.
                                    </p>

                                    <div className="mt-12 rounded-3xl bg-white/5 p-10 border border-white/10 text-center backdrop-blur-sm">
                                        <h3 className="mb-4 text-2xl font-bold text-white tracking-tight">Read the full story</h3>
                                        <p className="mb-8 text-gray-400 font-normal">This article was originally published on {newsItem.source}. Click below to read the complete coverage on the original platform.</p>
                                        <a
                                            href={newsItem.link || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-500/20"
                                        >
                                            Continue reading on {newsItem.source}
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar/Ad Placeholder or Additional Info */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="rounded-3xl border border-white/5 bg-white/5 p-8">
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-400">Market Context</h4>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                    Stay updated with real-time market movements and community analysis.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['Market', 'Finance', 'Analysis', 'Economy'].map(tag => (
                                        <span key={tag} className="rounded-lg bg-white/5 px-3 py-1 text-[10px] font-bold text-gray-400 border border-white/5 uppercase tracking-wider">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="border-t border-white/5 pt-12">
                        <div className="flex flex-col sm:flex-row gap-6 justify-between items-stretch transition-all">
                            {prevNews ? (
                                <Link
                                    to={`/news/${prevNews.id}`}
                                    className="flex-1 group flex flex-col p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                        <ArrowLeft className="h-3 w-3" /> Previous Article
                                    </span>
                                    <span className="text-lg font-bold text-white line-clamp-2">{prevNews.title}</span>
                                </Link>
                            ) : <div className="flex-1" />}

                            {nextNews ? (
                                <Link
                                    to={`/news/${nextNews.id}`}
                                    className="flex-1 group flex flex-col p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-right items-end"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                        Next Article <ArrowLeft className="h-3 w-3 rotate-180" />
                                    </span>
                                    <span className="text-lg font-bold text-white line-clamp-2">{nextNews.title}</span>
                                </Link>
                            ) : <div className="flex-1" />}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
