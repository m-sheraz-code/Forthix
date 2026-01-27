import { Loader2 } from 'lucide-react';

interface StockDataLoaderProps {
  variant?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function StockDataLoader({
  variant = 'spinner',
  size = 'md',
  message = 'Loading data...',
  className = '',
}: StockDataLoaderProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', container: 'h-32', text: 'text-xs' },
    md: { icon: 'h-10 w-10', container: 'h-[400px]', text: 'text-sm' },
    lg: { icon: 'h-14 w-14', container: 'h-[500px]', text: 'text-base' },
  };

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {/* Skeleton cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/5 bg-gray-900/50 p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-12 rounded bg-white/10" />
                  <div className="h-5 w-32 rounded bg-white/10" />
                </div>
                <div className="h-9 w-9 rounded-xl bg-white/10" />
              </div>
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <div className="h-7 w-24 rounded bg-white/10" />
                  <div className="h-4 w-16 rounded bg-white/10" />
                </div>
                <div className="h-12 w-28 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={`flex items-center justify-center ${sizes[size].container} ${className}`}
      >
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <div className="h-2 w-2 rounded-full bg-blue-500 animation-delay-150" />
          <div className="h-2 w-2 rounded-full bg-blue-500 animation-delay-300" />
        </div>
      </div>
    );
  }

  // Default: spinner
  return (
    <div
      className={`flex flex-col items-center justify-center ${sizes[size].container} ${className}`}
      aria-busy="true"
      aria-label={message}
    >
      <Loader2 className={`${sizes[size].icon} animate-spin text-blue-500`} />
      {message && (
        <p className={`mt-4 ${sizes[size].text} text-gray-500`}>{message}</p>
      )}
    </div>
  );
}
