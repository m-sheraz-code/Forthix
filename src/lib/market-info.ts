export interface MarketIndicatorInfo {
    label: string;
    explanation: string;
}

export const MARKET_INDICATORS_INFO: Record<string, MarketIndicatorInfo> = {
    'SPX': {
        label: 'Market (S&P 500)',
        explanation: 'Tracks the overall U.S. market. It’s the main health check for stocks.'
    },
    '^GSPC': {
        label: 'Market (S&P 500)',
        explanation: 'Tracks the overall U.S. market. It’s the main health check for stocks.'
    },
    'IXIC': {
        label: 'Tech Stocks (Nasdaq)',
        explanation: 'Tech usually moves first and sets the tone for the day.'
    },
    '^IXIC': {
        label: 'Tech Stocks (Nasdaq)',
        explanation: 'Tech usually moves first and sets the tone for the day.'
    },
    'NDX': {
        label: 'Tech Stocks (Nasdaq)',
        explanation: 'Tech usually moves first and sets the tone for the day.'
    },
    '^NDX': {
        label: 'Tech Stocks (Nasdaq)',
        explanation: 'Tech usually moves first and sets the tone for the day.'
    },
    'DJI': {
        label: 'Blue-Chip Stocks (Dow)',
        explanation: 'Shows how strong and stable big, established companies are.'
    },
    '^DJI': {
        label: 'Blue-Chip Stocks (Dow)',
        explanation: 'Shows how strong and stable big, established companies are.'
    },
    'RUT': {
        label: 'Small-Cap Stocks',
        explanation: 'When small companies rise, investors are more confident and willing to take risk.'
    },
    '^RUT': {
        label: 'Small-Cap Stocks',
        explanation: 'When small companies rise, investors are more confident and willing to take risk.'
    },
    'VIX': {
        label: 'Market Fear (Volatility / VIX)',
        explanation: 'High fear = bigger price swings and higher risk.'
    },
    '^VIX': {
        label: 'Market Fear (Volatility / VIX)',
        explanation: 'High fear = bigger price swings and higher risk.'
    },
    'DXY': {
        label: 'U.S. Dollar (DXY)',
        explanation: 'A strong dollar can slow down stocks and crypto.'
    },
    'DX-Y.NYB': {
        label: 'U.S. Dollar (DXY)',
        explanation: 'A strong dollar can slow down stocks and crypto.'
    },
    'TNX': {
        label: 'U.S. 10Y Yield',
        explanation: 'Shows the interest rate on government bonds. High rates can pressure stocks.'
    },
    '^TNX': {
        label: 'U.S. 10Y Yield',
        explanation: 'Shows the interest rate on government bonds. High rates can pressure stocks.'
    },
    'PARTICIPATION': {
        label: 'Market Participation (Advance vs Decline)',
        explanation: 'More stocks rising than falling = healthier market movement.'
    },
    'MSFT': {
        label: 'Microsoft',
        explanation: 'A global leader in software and cloud computing. One of the world’s most valuable companies.'
    },
    'AAPL': {
        label: 'Apple',
        explanation: 'The maker of iPhone and Mac. A key indicator of consumer tech health.'
    },
    'NVDA': {
        label: 'Nvidia',
        explanation: 'The leader in AI chips. Moves based on the global AI and tech boom.'
    },
    'TSLA': {
        label: 'Tesla',
        explanation: 'A leader in electric vehicles and clean energy. Highly volatile and watched by retail traders.'
    },
    'GOOGL': {
        label: 'Google (Alphabet)',
        explanation: 'The king of search and advertising. A core part of the digital economy.'
    },
    'AMZN': {
        label: 'Amazon',
        explanation: 'The giant of e-commerce and cloud services. Reflects consumer spending power.'
    },
    'META': {
        label: 'Meta (Facebook)',
        explanation: 'Owner of Instagram and WhatsApp. A key player in social media and the Metaverse.'
    }
};

export function getMarketIndicatorLabel(symbol: string, defaultName: string): string {
    return MARKET_INDICATORS_INFO[symbol]?.label || MARKET_INDICATORS_INFO[symbol.toUpperCase()]?.label || defaultName;
}

export function getMarketIndicatorExplanation(symbol: string): string | undefined {
    return MARKET_INDICATORS_INFO[symbol]?.explanation || MARKET_INDICATORS_INFO[symbol.toUpperCase()]?.explanation;
}
