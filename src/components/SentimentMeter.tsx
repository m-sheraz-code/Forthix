// Sentiment Meter component using SVG gauge
type SentimentType = 'strong-sell' | 'sell' | 'neutral' | 'buy' | 'strong-buy';

interface SentimentMeterProps {
    type: SentimentType;
    label: string;
}

const SENTIMENT_CONFIG = {
    'strong-sell': { angle: -72, color: '#ef4444', label: 'Strong Sell' },
    'sell': { angle: -36, color: '#f87171', label: 'Sell' },
    'neutral': { angle: 0, color: '#94a3b8', label: 'Neutral' },
    'buy': { angle: 36, color: '#60a5fa', label: 'Buy' },
    'strong-buy': { angle: 72, color: '#3b82f6', label: 'Strong Buy' },
};

export default function SentimentMeter({ type, label }: SentimentMeterProps) {
    const config = SENTIMENT_CONFIG[type];

    return (
        <div className="flex flex-col items-center justify-center p-2 w-full">
            <div className="relative h-28 w-full max-w-[12rem] overflow-visible flex items-center justify-center">
                <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                    {/* Background Arc Shadow */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Colored Background Arc Groups */}
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="25%" stopColor="#f87171" />
                            <stop offset="50%" stopColor="#64748b" />
                            <stop offset="75%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>

                        {/* Glow for the active area */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Colored Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="opacity-40"
                    />

                    {/* Subtle Markers */}
                    {[0, 22.5, 45, 67.5, 90].map((p, i) => {
                        const angle = -90 + (i * 45);
                        return (
                            <line
                                key={i}
                                x1="50"
                                y1="50"
                                x2="50"
                                y2="42"
                                stroke="#334155"
                                strokeWidth="2"
                                transform={`rotate(${angle} 50 50)`}
                            />
                        );
                    })}

                    {/* Needle - Improved Tapered Shape */}
                    <g style={{
                        transform: `rotate(${config.angle}deg)`,
                        transformOrigin: '50px 50px',
                        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        {/* Needle Body */}
                        <path
                            d="M 48.5 50 L 50 12 L 51.5 50 Z"
                            fill="white"
                            filter="url(#glow)"
                            style={{ filter: `drop-shadow(0 0 8px ${config.color})` }}
                        />
                        {/* Needle Pin */}
                        <circle cx="50" cy="50" r="3.5" fill="#0f172a" stroke="white" strokeWidth="2" />
                    </g>
                </svg>

                {/* Center Indicator Glow */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div className="h-1 w-1 rounded-full bg-white shadow-[0_0_12px_white]" />
                </div>
            </div>

            <div className="mt-2 text-center">
                <p className="text-xl font-black tracking-tight" style={{
                    color: config.color,
                    textShadow: `0 0 15px ${config.color}30`
                }}>
                    {type.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 tracking-[0.2em] whitespace-nowrap opacity-70">
                    {label}
                </p>
            </div>
        </div>
    );
}
