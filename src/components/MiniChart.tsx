import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface MiniChartProps {
  data: { time: string; value: number }[];
  isPositive: boolean;
}

export default function MiniChart({ data, isPositive }: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
        <YAxis hide domain={['dataMin - 1%', 'dataMax + 1%']} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#030712',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '12px',
            padding: '8px 12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            borderLeft: `4px solid ${isPositive ? '#10b981' : '#ef4444'}`,
          }}
          itemStyle={{ color: '#fff', fontWeight: '700' }}
          labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
          formatter={(value: number | undefined) => {
            if (value === undefined) return ['', 'Value'];
            return [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Price'];
          }}
          labelFormatter={(label) => {
            try {
              return new Date(label).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
            } catch (e) {
              return label;
            }
          }}
          cursor={{ stroke: isPositive ? '#10b981' : '#ef4444', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: isPositive ? '#10b981' : '#ef4444' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
