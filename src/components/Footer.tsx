import { Link } from 'react-router-dom';
import { Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <span className="text-sm font-bold text-gray-950">F</span>
              </div>
              <span className="text-sm font-semibold">Forthix</span>
            </div>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Products</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/markets" className="hover:text-white">SuperCharts</Link></li>
              <li><Link to="/markets" className="hover:text-white">Advanced Screener</Link></li>
              <li><Link to="/markets" className="hover:text-white">Stock Screeners</Link></li>
              <li><Link to="/markets" className="hover:text-white">Forex Screeners</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Wall of Love</a></li>
              <li><a href="#" className="hover:text-white">Partners</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Community</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/ideas" className="hover:text-white">Refer a friend</Link></li>
              <li><Link to="/ideas" className="hover:text-white">Ideas</Link></li>
              <li><Link to="/ideas" className="hover:text-white">Moderators</Link></li>
              <li><Link to="/ideas" className="hover:text-white">Streams</Link></li>
              <li><a href="#" className="hover:text-white">Chat</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">For Business</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Widgets</a></li>
              <li><a href="#" className="hover:text-white">Advertising</a></li>
              <li><a href="#" className="hover:text-white">Brokerage & Retail Solutions</a></li>
              <li><a href="#" className="hover:text-white">Charting Libraries</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row">
            <p className="text-sm text-gray-500">
              2026-2050 by Forthix Ltd. Data delayed at least 15 minutes.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white">Terms of Use</a>
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
