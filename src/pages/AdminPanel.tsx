import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileUp, Save, LogIn, Newspaper, Lightbulb } from 'lucide-react';

const AdminPanel: React.FC = () => {
    // Debug: Check if env variables are loaded correctly
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    console.log('AdminPanel Loaded');
    console.log('Supabase URL:', envUrl);
    console.log('Supabase Key Detected:', envKey ? 'Yes' : 'No');

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState<'news' | 'idea'>('news');

    // Form states
    const [newsForm, setNewsForm] = useState({ title: '', content: '', image: null as File | null });
    const [ideaForm, setIdeaForm] = useState({ title: '', content: '', symbol: '', image: null as File | null });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setMessage({ text: 'Logged in successfully', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Invalid credentials', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Login failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        console.log(`Uploading to bucket "images", path: ${filePath}`);

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Supabase upload error details:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleAddNews = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let image_url = '';
            if (newsForm.image) {
                try {
                    image_url = await uploadImage(newsForm.image);
                } catch (uploadError: any) {
                    console.error('Image upload failed:', uploadError);
                    throw new Error(`Image upload failed: ${uploadError.message || 'Check your Supabase bucket'}`);
                }
            }

            const payload = {
                title: newsForm.title,
                content: newsForm.content,
                image_url,
                username,
                password
            };

            let response;
            try {
                response = await fetch('/api/news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } catch (fetchError: any) {
                console.error('API fetch failed:', fetchError);
                throw new Error(`API Connection failed: ${fetchError.message || 'Is the server running?'}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Server Error:', { status: response.status, body: errorText });
                let errorJson;
                try { errorJson = JSON.parse(errorText); } catch (e) { }
                setMessage({ text: errorJson?.error || errorJson?.message || `Server Error: ${response.status}`, type: 'error' });
                return;
            }

            const data = await response.json();
            if (data.success) {
                setMessage({ text: 'News added successfully!', type: 'success' });
                setNewsForm({ title: '', content: '', image: null });
            }
        } catch (error: any) {
            console.error('Add news error:', error);
            setMessage({ text: error.message || 'Error adding news', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let image_url = '';
            if (ideaForm.image) {
                image_url = await uploadImage(ideaForm.image);
            }

            const payload = {
                title: ideaForm.title,
                content: ideaForm.content,
                symbol: ideaForm.symbol,
                image_url,
                username,
                password
            };

            const response = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Idea Server Error:', { status: response.status, body: errorText });
                let errorJson;
                try { errorJson = JSON.parse(errorText); } catch (e) { }
                setMessage({ text: errorJson?.error || errorJson?.message || `Server Error: ${response.status}`, type: 'error' });
                return;
            }

            const data = await response.json();
            if (data.idea) {
                setMessage({ text: 'Idea added successfully!', type: 'success' });
                setIdeaForm({ title: '', content: '', symbol: '', image: null });
            }
            else {
                setMessage({ text: data.error || 'Failed to add idea', type: 'error' });
            }
        } catch (error: any) {
            console.error('Add idea error:', error);
            setMessage({ text: error.message || 'Error adding idea', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                            <LogIn className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                        <p className="text-slate-400 text-center mb-4">Enter your credentials to access the panel</p>

                        {/* Debug Info in UI */}
                        {!envUrl || envUrl.includes('placeholder') ? (
                            <div className="w-full p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs text-center">
                                ⚠️ VITE_SUPABASE_URL not loaded. Restart your server!
                            </div>
                        ) : null}
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>
                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                {message.text}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Panel</h1>
                        <p className="text-slate-400">Manage News and Community Ideas</p>
                    </div>
                    <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('news')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Newspaper className="w-4 h-4" />
                            News
                        </button>
                        <button
                            onClick={() => setActiveTab('idea')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${activeTab === 'idea' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            Idea
                        </button>
                    </div>
                </header>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'news' ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
                        <form onSubmit={handleAddNews} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">News Title</label>
                                <input
                                    type="text"
                                    value={newsForm.title}
                                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                    placeholder="Enter news heading..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
                                <textarea
                                    rows={6}
                                    value={newsForm.content}
                                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                    placeholder="Write news content here..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Featured Image</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileUp className="w-8 h-8 text-slate-500 mb-2" />
                                            <p className="text-sm text-slate-400">
                                                {newsForm.image ? newsForm.image.name : 'Click to upload or drag and drop'}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setNewsForm({ ...newsForm, image: e.target.files ? e.target.files[0] : null })}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'Publishing...' : 'Publish News'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
                        <form onSubmit={handleAddIdea} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Idea Title</label>
                                    <input
                                        type="text"
                                        value={ideaForm.title}
                                        onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                                        placeholder="Enter idea title..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Symbol (Optional)</label>
                                    <input
                                        type="text"
                                        value={ideaForm.symbol}
                                        onChange={(e) => setIdeaForm({ ...ideaForm, symbol: e.target.value })}
                                        placeholder="e.g. BTCUSD"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Content / Analysis</label>
                                <textarea
                                    rows={6}
                                    value={ideaForm.content}
                                    onChange={(e) => setIdeaForm({ ...ideaForm, content: e.target.value })}
                                    placeholder="Share your analysis..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Chart Image (Optional)</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileUp className="w-8 h-8 text-slate-500 mb-2" />
                                            <p className="text-sm text-slate-400">
                                                {ideaForm.image ? ideaForm.image.name : 'Click to upload or drag and drop'}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setIdeaForm({ ...ideaForm, image: e.target.files ? e.target.files[0] : null })}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'Publishing...' : 'Post Idea'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
