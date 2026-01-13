import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';

interface PricePoint {
  time: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface PriceChartProps {
  data: PricePoint[];
  isPositive: boolean;
  chartType?: string;
}

// Custom Candlestick shape

// Simplified Candlestick for Recharts using Bar with range
export default function PriceChart({ data, isPositive, chartType = 'area' }: PriceChartProps) {
  // Prep data for Recharts range bars
  // Recharts Bar in ComposedChart can take [min, max] for its value
  const chartData = data.map(d => {
    const o = d.open ?? d.value;
    const c = d.close ?? d.value;
    const h = d.high ?? Math.max(o, c);
    const l = d.low ?? Math.min(o, c);
    const isUp = c >= o;

    return {
      ...d,
      candleBody: [Math.min(o, c), Math.max(o, c)],
      candleWick: [l, h],
      barBody: [l, h], // For OHLC bar chart
      color: isUp ? '#22c55e' : '#ef4444'
    };
  });

  const renderChart = () => {
    switch (chartType) {
      case 'candle':
        return (
          <>
            <Bar
              dataKey="candleWick"
              fill="none"
              barSize={1}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-wick-${index}`} stroke={entry.color} strokeWidth={1} />
              ))}
            </Bar>
            <Bar
              dataKey="candleBody"
              barSize={8}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-body-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </>
        );
      case 'bar':
        // OHLC Bar chart style
        return (
          <Bar
            dataKey="candleWick"
            fill="none"
            barSize={1}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-ohlc-${index}`} stroke={entry.color} strokeWidth={2} />
            ))}
          </Bar>
        );
      case 'line':
        return (
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#3b82f6' : '#ef4444'}
            strokeWidth={2}
            dot={false}
          />
        );
      case 'area':
      default:
        return (
          <>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#3b82f6' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? '#3b82f6' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#3b82f6' : '#ef4444'}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
            />
          </>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          orientation="right"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          domain={['auto', 'auto']}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#030712',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '12px',
            padding: '8px',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(value: any, name?: string) => {
            if (name === 'candleWick') return ['', ''];
            const price = Array.isArray(value) ? value[1] : value;
            return [`$${price.toLocaleString()}`, 'Price'];
          }}
          labelFormatter={(label) => new Date(label).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        />
        {renderChart()}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
