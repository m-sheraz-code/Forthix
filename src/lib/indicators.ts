/**
 * Technical Indicators utility for market analysis
 */

export interface AnalysisResult {
    type: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
    label: string;
}

export interface MarketAnalysis {
    oscillators: AnalysisResult;
    movingAverages: AnalysisResult;
    summary: AnalysisResult;
}

export function calculateSMA(data: number[], period: number): number | null {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
    return sum / period;
}

export function calculateRSI(data: number[], period: number = 14): number | null {
    if (data.length <= period) return null;

    let gains = 0;
    let losses = 0;

    // Initial average
    for (let i = 1; i <= period; i++) {
        const diff = data[i] - data[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Smoothing
    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i] - data[i - 1];
        if (diff >= 0) {
            avgGain = (avgGain * (period - 1) + diff) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) - diff) / period;
        }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

export function getTechnicalAnalysis(chartData: { value: number }[] | undefined): MarketAnalysis {
    if (!chartData || chartData.length < 2) {
        return {
            oscillators: { type: 'neutral', label: 'No Data' },
            movingAverages: { type: 'neutral', label: 'No Data' },
            summary: { type: 'neutral', label: 'No Data' }
        };
    }

    const prices = chartData.map(d => d.value);
    const lastPrice = prices[prices.length - 1];

    // 1. Oscillators (RSI as primary)
    const rsi = calculateRSI(prices);
    let osc: AnalysisResult = { type: 'neutral', label: 'Neutral Trend' };

    if (rsi !== null) {
        if (rsi < 30) osc = { type: 'strong-buy', label: 'Oversold' };
        else if (rsi < 45) osc = { type: 'buy', label: 'Bullish Momentum' };
        else if (rsi > 70) osc = { type: 'strong-sell', label: 'Overbought' };
        else if (rsi > 55) osc = { type: 'sell', label: 'Bearish Momentum' };
    }

    // 2. Moving Averages (SMA10 vs SMA20)
    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    let ma: AnalysisResult = { type: 'neutral', label: 'Neutral' };

    if (sma10 !== null && sma20 !== null) {
        if (sma10 > sma20) {
            ma = lastPrice > sma10 ? { type: 'strong-buy', label: 'Strong Uptrend' } : { type: 'buy', label: 'Bullish Cross' };
        } else {
            ma = lastPrice < sma10 ? { type: 'strong-sell', label: 'Strong Downtrend' } : { type: 'sell', label: 'Bearish Cross' };
        }
    }

    // 3. Summary scoring
    const scores: Record<string, number> = {
        'strong-sell': -2,
        'sell': -1,
        'neutral': 0,
        'buy': 1,
        'strong-buy': 2
    };

    const totalScore = (scores[osc.type] + scores[ma.type]) / 2;
    let summaryType: AnalysisResult['type'] = 'neutral';
    let summaryLabel = 'Neutral Market';

    if (totalScore <= -1.5) {
        summaryType = 'strong-sell';
        summaryLabel = 'Strong Resistance';
    } else if (totalScore <= -0.5) {
        summaryType = 'sell';
        summaryLabel = 'Bearish Outlook';
    } else if (totalScore >= 1.5) {
        summaryType = 'strong-buy';
        summaryLabel = 'Strong Support';
    } else if (totalScore >= 0.5) {
        summaryType = 'buy';
        summaryLabel = 'Bullish Outlook';
    }

    return {
        oscillators: osc,
        movingAverages: ma,
        summary: { type: summaryType, label: summaryLabel }
    };
}
