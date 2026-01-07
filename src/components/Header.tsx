import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Search, Globe, LogOut, Settings, List, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 1) {
      setShowSearch(true);
      const { data } = await api.searchStocks(query);
      if (data?.results) {
        setSearchResults(data.results.slice(0, 5));
      }
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <span className="text-sm font-bold text-gray-950">F</span>
            </div>
            <span className="text-sm font-semibold">Forthix</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm text-gray-300 hover:text-white">
              Products
            </Link>
            <Link to="/ideas" className="text-sm text-gray-300 hover:text-white">
              Community
            </Link>
            <Link to="/markets" className="text-sm text-gray-300 hover:text-white">
              Markets
            </Link>
            <Link to="/news" className="text-sm text-gray-300 hover:text-white">
              Stories
            </Link>
            <button className="text-sm text-gray-300 hover:text-white">
              More
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search stocks..."
                className="w-32 bg-transparent text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {searchResults.map((result) => (
                  <Link
                    key={result.symbol}
                    to={`/indices/${result.symbol}`}
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{result.symbol}</div>
                      <div className="text-xs text-gray-400 truncate">{result.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">{result.exchange}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
                  {user.email[0].toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="text-sm font-medium text-white truncate">
                      {user.profile?.display_name || user.email}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{user.email}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/watchlist"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <List className="w-4 h-4" />
                      My Watchlists
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-700 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm text-gray-300 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get started
              </Link>
            </>
          )}

          <button className="text-gray-400 hover:text-white">
            <Globe className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
