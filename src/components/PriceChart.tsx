import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data: { time: string; value: number }[];
  isPositive: boolean;
}

export default function PriceChart({ data, isPositive }: PriceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isPositive ? '#3b82f6' : '#ef4444'}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={isPositive ? '#3b82f6' : '#ef4444'}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number) => value.toFixed(2)}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#3b82f6' : '#ef4444'}
          strokeWidth={2}
          fill="url(#priceGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
