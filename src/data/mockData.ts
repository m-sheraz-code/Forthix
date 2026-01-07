export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: { time: string; value: number }[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  author: string;
  time: string;
  image: string;
  likes: number;
  comments: number;
}

export interface Broker {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  verified: boolean;
}

export const majorIndices: MarketIndex[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    price: 6902.04,
    change: 44.80,
    changePercent: 0.65,
    chartData: generateChartData(6850, 6920, 30),
  },
  {
    symbol: 'NDX',
    name: 'Nasdaq 100',
    price: 20400.32,
    change: 156.20,
    changePercent: 0.77,
    chartData: generateChartData(20200, 20450, 30),
  },
  {
    symbol: 'N225',
    name: 'Nikkei 225',
    price: 33568.93,
    change: -84.12,
    changePercent: -0.25,
    chartData: generateChartData(33400, 33700, 30),
  },
  {
    symbol: 'FTSE',
    name: 'FTSE 100',
    price: 10054.57,
    change: 23.45,
    changePercent: 0.23,
    chartData: generateChartData(10000, 10100, 30),
  },
  {
    symbol: 'DAX',
    name: 'DAX',
    price: 24868.83,
    change: 187.34,
    changePercent: 0.76,
    chartData: generateChartData(24600, 24900, 30),
  },
  {
    symbol: 'CAC',
    name: 'CAC 40',
    price: 8311.50,
    change: 45.67,
    changePercent: 0.55,
    chartData: generateChartData(8250, 8350, 30),
  },
];

export const sseCompositeData = {
  symbol: '000001',
  name: 'SSE Composite Index',
  exchange: 'Shanghai Stock Exchange',
  price: 4083.6672,
  change: 60.2559,
  changePercent: 1.50,
  open: 4028.0758,
  previousClose: 4023.4167,
  volume: 70256,
  dayRange: { low: 4025.0980, high: 4083.6672 },
  ytdChange: 8.21,
  oneYearChange: 4.56,
  chartData: generateChartData(4000, 4100, 180),
  candlestickData: generateCandlestickData(4000, 4100, 90),
  relatedIndices: [
    {
      symbol: '399001',
      name: 'SZSE Component Index',
      price: 14822.0240,
      change: -12.34,
      changePercent: -0.08,
    },
    {
      symbol: '399106',
      name: 'SZSE 100 Index',
      price: 2617.7145,
      change: 18.56,
      changePercent: 0.72,
    },
    {
      symbol: '000852',
      name: 'CSI 852 Index',
      price: 7684.9034,
      change: -23.45,
      changePercent: -0.30,
    },
    {
      symbol: '399673',
      name: 'HS Tech Index',
      price: 16706.46,
      change: 89.12,
      changePercent: 0.54,
    },
  ],
};

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'DJ: Dow Jones Closes 49,006 for New Record',
    source: 'DJ News',
    time: '24 hours ago',
    category: 'Trading Economics',
  },
  {
    id: '2',
    title: 'NASDAQ: Futures Move to Extended Sessions',
    source: 'NASDAQ',
    time: '8 hours ago',
    category: 'Trading Economics',
  },
  {
    id: '3',
    title: 'BAL: Nasdaq Futures Up 0.5% as Markets Embrace Tech Stocks Once Again',
    source: 'BAL News',
    time: '1 day ago',
    category: 'Trading Economics',
  },
  {
    id: '4',
    title: 'NASDAQ: Bitcoin\'s New Streak is First Trader of 2026. What\'s Gonna be in This Year?',
    source: 'NASDAQ',
    time: '2 days ago',
    category: 'Trading Economics',
  },
  {
    id: '5',
    title: 'XAU/USD: Gold Prices Soar $242 as in Bullish S&B in Traders Scramble to Buy the Dip',
    source: 'Keep reading',
    time: '3 days ago',
    category: 'Keep reading',
  },
  {
    id: '6',
    title: 'BTC/USD: Bitcoin Climbs Above $93,000 as Crypto Rally Jumps 2025 with Enthusiasm',
    source: 'Forecast',
    time: '4 days ago',
    category: 'Forecast',
  },
  {
    id: '7',
    title: 'EUR/USD: Euro Recoils Slide Toward $1.05; Market Sees Major Money Averages',
    source: 'EUR US',
    time: '5 days ago',
    category: 'Flows',
  },
  {
    id: '8',
    title: 'USD/JPY: Yen Soars Nearly 3% vs USD. What\'s the Outlook for Near Year?',
    source: 'Set up free',
    time: '5 days ago',
    category: 'News',
  },
  {
    id: '9',
    title: 'XAU/USD: Gold Prices Record Above $2,400 as Embed Into Price Picks',
    source: 'Keep reading',
    time: '1 week ago',
    category: 'Keep reading',
  },
  {
    id: '10',
    title: 'SPY: S&P 500 Etoro Hits as Traders Seek to Buy the Dip at Record Highs',
    source: 'Keep reading',
    time: '1 week ago',
    category: 'Keep reading',
  },
];

export const ideasItems: IdeaItem[] = [
  {
    id: '1',
    title: '$LIS is on the verge of another rally (4H)',
    author: 'SaxoBank',
    time: '2 days ago',
    image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
    likes: 23,
    comments: 268,
  },
  {
    id: '2',
    title: 'XAU/USD (H4) - Monday Setup',
    author: 'LightTrading247',
    time: '2 days ago',
    image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
    likes: 97,
    comments: 196,
  },
  {
    id: '3',
    title: '$TBITC W Pattern Makes the Case for a Macro Bull Market',
    author: 'Blue_Wave',
    time: '2 days ago',
    image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg',
    likes: 58,
    comments: 533,
  },
  {
    id: '4',
    title: 'SSE Composite Index - Weekly Technical Analysis',
    author: 'TechMaster',
    time: '3 days ago',
    image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg',
    likes: 142,
    comments: 89,
  },
  {
    id: '5',
    title: 'China eINFO',
    author: 'Investormania',
    time: '4 days ago',
    image: 'https://images.pexels.com/photos/7567486/pexels-photo-7567486.jpeg',
    likes: 234,
    comments: 156,
  },
  {
    id: '6',
    title: 'The Battle to Defend 3600.00 in Shanghai Composite',
    author: 'TradeGenius',
    time: '5 days ago',
    image: 'https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg',
    likes: 412,
    comments: 267,
  },
];

export const topStocks = {
  highestVolume: [
    { symbol: 'NVDA', name: 'Nvidia Corporation', price: 188.12, change: 5.67, changePercent: 3.10 },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 431.87, change: 12.34, changePercent: 2.94 },
    { symbol: 'AAPL', name: 'Apple Inc', price: 257.45, change: 3.89, changePercent: 1.53 },
  ],
  gainers: [
    { symbol: 'NVDA', name: 'Nvidia Corp', price: 8.89, change: 2.34, changePercent: 35.71 },
    { symbol: 'BKKT', name: 'Bakkt Inc', price: 11.03, change: 2.87, changePercent: 35.16 },
    { symbol: 'PLTR', name: 'Palantir Tech', price: 82.11, change: 15.67, changePercent: 23.58 },
  ],
  losers: [
    { symbol: 'COIN', name: 'Coinbase Global', price: 5.89, change: -4.23, changePercent: -41.79 },
    { symbol: 'JOYA', name: 'Journey Energy Inc', price: 2.47, change: -1.56, changePercent: -38.71 },
    { symbol: 'ONLK', name: 'Onebook Corp', price: 3.68, change: -1.89, changePercent: -33.93 },
  ],
};

export const brokers: Broker[] = [
  {
    id: '1',
    name: 'CMC Markets',
    logo: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg',
    rating: 4.4,
    reviews: 1657,
    verified: true,
  },
  {
    id: '2',
    name: 'Gate',
    logo: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
    rating: 4.9,
    reviews: 8234,
    verified: true,
  },
  {
    id: '3',
    name: 'OKX',
    logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg',
    rating: 4.4,
    reviews: 3456,
    verified: true,
  },
];

function generateChartData(min: number, max: number, points: number) {
  const data = [];
  const now = Date.now();
  let currentValue = min + (max - min) * 0.3;

  for (let i = 0; i < points; i++) {
    const time = new Date(now - (points - i) * 3600000).toISOString();
    currentValue += (Math.random() - 0.45) * ((max - min) / points) * 2;
    currentValue = Math.max(min, Math.min(max, currentValue));
    data.push({
      time,
      value: Number(currentValue.toFixed(2)),
    });
  }

  return data;
}

function generateCandlestickData(min: number, max: number, points: number) {
  const data = [];
  const now = Date.now();
  let currentClose = min + (max - min) * 0.5;

  for (let i = 0; i < points; i++) {
    const time = new Date(now - (points - i) * 86400000).toISOString().split('T')[0];
    const open = currentClose;
    const volatility = (max - min) * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const close = Math.max(min, Math.min(max, open + change));
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 100000000) + 50000000;

    data.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentClose = close;
  }

  return data;
}
