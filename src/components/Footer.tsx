import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Markets', path: '/markets' },
    { name: 'News', path: '/news' },
    { name: 'Ideas', path: '/ideas' },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#' },
    { icon: Github, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-brand-dark border-t border-gray-900 pb-12 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 text-center">
          {/* Logo & Description */}
          <div className="flex flex-col items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white transition-all group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <span className="text-lg font-bold text-brand-dark">F</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Forthix</span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              The world's most advanced trading platform and social network for traders and investors.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 transition-all hover:border-white hover:bg-white"
                >
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-950 transition-colors" />
                </a>
              );
            })}
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col items-center gap-6 pt-8 border-t border-gray-900 w-full">
            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500 uppercase tracking-widest">
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
              <Link to="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
              <Link to="/support" className="hover:text-gray-300 transition-colors">Support</Link>
            </div>
            <p className="text-xs text-gray-600">
              © {currentYear} Forthix Ltd. Data may be delayed. Market analysis provided for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
