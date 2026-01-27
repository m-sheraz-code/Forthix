import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export default function SplashScreen({ onComplete, minDuration = 1500 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for fade-out animation to complete
      setTimeout(onComplete, 300);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      aria-busy="true"
      aria-label="Loading Forthix"
    >
      {/* Logo and Brand */}
      <div className="mb-8 flex items-center gap-3 animate-pulse-slow">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <span className="text-4xl font-black tracking-tight text-white">
          Forthix
        </span>
      </div>

      {/* Tagline */}
      <p className="mb-10 text-sm font-medium tracking-widest text-gray-500 uppercase">
        Insight first / Then action
      </p>

      {/* Loading Bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-full animate-gradient-flow" />
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-xs text-gray-600 animate-pulse">
        Loading market data...
      </p>
    </div>
  );
}
