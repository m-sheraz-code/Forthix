import { Link } from 'react-router-dom';
import MiniChart from './MiniChart';

interface MarketCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: { time: string; value: number }[];
}

export default function MarketCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  chartData,
}: MarketCardProps) {
  const isPositive = change >= 0;

  return (
    <Link
      to={`/indices/${symbol}`}
      className="group rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400">{symbol}</p>
          <h3 className="mt-1 text-sm font-medium text-white group-hover:text-blue-400">
            {name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">
            {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>
      <div className="h-16">
        <MiniChart data={chartData} isPositive={isPositive} />
      </div>
    </Link>
  );
}
