import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Markets', path: '/markets' },
    { name: 'News', path: '/news' },
    { name: 'Ideas', path: '/ideas' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-gray-950/80 backdrop-blur-md border-b border-gray-800 py-3'
          : 'bg-transparent border-b border-transparent py-5'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all">
            <span className="text-lg font-bold text-gray-950">F</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Forthix
          </span>
        </Link>

        {/* Desktop Navigation - Right Aligned */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-all duration-200 hover:text-white ${location.pathname === link.path ? 'text-white' : 'text-gray-400'
                }`}
            >
              <span className="relative py-1">
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                )}
              </span>
            </Link>
          ))}

          <Link
            to="/markets"
            className="ml-4 rounded-full bg-white px-6 py-2 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-950 border-b border-gray-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4 px-6 py-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-medium ${location.pathname === link.path ? 'text-white' : 'text-gray-400'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/markets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-gray-950 transition-all hover:bg-gray-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
