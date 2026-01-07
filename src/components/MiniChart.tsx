import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: { time: string; value: number }[];
  isPositive: boolean;
}

export default function MiniChart({ data, isPositive }: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isPositive ? '#10b981' : '#ef4444'}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={isPositive ? '#10b981' : '#ef4444'}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
