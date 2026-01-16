import React from 'react';

interface StockIconProps {
    symbol: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const STOCK_DOMAIN_MAP: Record<string, string> = {
    'AAPL': 'apple.com',
    'GOOGL': 'google.com',
    'GOOG': 'google.com',
    'MSFT': 'microsoft.com',
    'TSLA': 'tesla.com',
    'AMZN': 'amazon.com',
    'META': 'meta.com',
    'NFLX': 'netflix.com',
    'NVDA': 'nvidia.com',
    'AMD': 'amd.com',
    'INTC': 'intel.com',
    'PYPL': 'paypal.com',
    'ADBE': 'adobe.com',
    'CRM': 'salesforce.com',
    'DIS': 'disney.com',
    'NKE': 'nike.com',
    'SBUX': 'starbucks.com',
    'V': 'visa.com',
    'MA': 'mastercard.com',
    'WMT': 'walmart.com',
    'COST': 'costco.com',
    'PEP': 'pepsico.com',
    'KO': 'cocacola.com',
    'BTC': 'bitcoin.org',
    'ETH': 'ethereum.org',
    'SOL': 'solana.com',
    'BNB': 'binance.com',
    'XRP': 'ripple.com',
};

const INDEX_ICON_MAP: Record<string, string> = {
    '^GSPC': 'https://s3-symbol-logo.tradingview.com/indices/s-and-p-500.svg',
    '^IXIC': 'https://s3-symbol-logo.tradingview.com/indices/nasdaq-100.svg',
    '^DJI': 'https://s3-symbol-logo.tradingview.com/indices/dow-30.svg',
    '^RUT': 'https://s3-symbol-logo.tradingview.com/indices/russell-2000.svg',
    '^VIX': 'https://s3-symbol-logo.tradingview.com/indices/vix.svg',
    '^FTSE': 'https://s3-symbol-logo.tradingview.com/indices/ftse-100.svg',
    '^N225': 'https://s3-symbol-logo.tradingview.com/indices/nikkei-225.svg',
    '^NQ': 'https://s3-symbol-logo.tradingview.com/indices/nasdaq-100.svg',
};

export default function StockIcon({ symbol, name, size = 'md', className = '' }: StockIconProps) {
    const [error, setError] = React.useState(false);
    const cleanSymbol = symbol.replace('$', '').toUpperCase();

    const sizeClasses = {
        sm: 'h-6 w-6 text-[10px]',
        md: 'h-10 w-10 text-xs',
        lg: 'h-12 w-12 text-sm',
        xl: 'h-16 w-16 text-lg',
    };

    const domain = STOCK_DOMAIN_MAP[cleanSymbol];
    const indexIcon = INDEX_ICON_MAP[symbol] || INDEX_ICON_MAP[cleanSymbol];

    const iconUrl = indexIcon
        ? indexIcon
        : domain
            ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
            : `https://logo.clearbit.com/${cleanSymbol.toLowerCase()}.com`;

    if (error || (!domain && !indexIcon && cleanSymbol.length > 5)) {
        return (
            <div className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 font-bold text-blue-500 ${className}`}>
                {cleanSymbol.substring(0, 1)}
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} relative flex-shrink-0 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 overflow-hidden ${className}`}>
            <img
                src={iconUrl}
                alt={name || symbol}
                className="h-full w-full object-contain p-1.5"
                onError={() => setError(true)}
            />
            {/* Subtle overlay to soften bright logos */}
            <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
        </div>
    );
}
