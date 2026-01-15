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
  timeRange?: string;
}

// Custom Candlestick Shape Component
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;

  if (!payload) return null;

  const { open = payload.value, close = payload.value, high, low, color } = payload;
  const candleOpen = open ?? payload.value;
  const candleClose = close ?? payload.value;
  const candleHigh = high ?? Math.max(candleOpen, candleClose);
  const candleLow = low ?? Math.min(candleOpen, candleClose);

  // Calculate positions
  const yScale = height / (Math.abs((payload.candleBody?.[1] || candleClose) - (payload.candleBody?.[0] || candleOpen)) || 1);
  const centerX = x + width / 2;

  // Wick dimensions
  const wickWidth = 2;

  // The body is already positioned by Recharts, we just need to add the wick
  const bodyTop = y;
  const bodyBottom = y + height;
  const bodyHeight = Math.max(height, 1);

  // For wick, we need to calculate based on high/low relative to open/close
  const wickData = payload.candleWick || [candleLow, candleHigh];
  const bodyData = payload.candleBody || [Math.min(candleOpen, candleClose), Math.max(candleOpen, candleClose)];

  // Calculate wick extensions
  const priceRange = wickData[1] - wickData[0];
  const bodyRange = bodyData[1] - bodyData[0];

  if (priceRange === 0) return null;

  const pixelsPerUnit = bodyHeight / (bodyRange || 1);

  // Top wick (from body top to high)
  const topWickHeight = (wickData[1] - bodyData[1]) * pixelsPerUnit;
  // Bottom wick (from body bottom to low)  
  const bottomWickHeight = (bodyData[0] - wickData[0]) * pixelsPerUnit;

  return (
    <g>
      {/* Top Wick */}
      {topWickHeight > 0 && (
        <line
          x1={centerX}
          y1={bodyTop - topWickHeight}
          x2={centerX}
          y2={bodyTop}
          stroke={color}
          strokeWidth={wickWidth}
        />
      )}
      {/* Bottom Wick */}
      {bottomWickHeight > 0 && (
        <line
          x1={centerX}
          y1={bodyBottom}
          x2={centerX}
          y2={bodyBottom + bottomWickHeight}
          stroke={color}
          strokeWidth={wickWidth}
        />
      )}
      {/* Candle Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 2)}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
        rx={2}
        ry={2}
      />
    </g>
  );
};

export default function PriceChart({ data, isPositive, chartType = 'area', timeRange = '1m' }: PriceChartProps) {
  // Prep data for Recharts range bars
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
      barBody: [l, h],
      color: isUp ? '#22c55e' : '#ef4444'
    };
  });

  const renderChart = () => {
    switch (chartType) {
      case 'candle':
        // Calculate dynamic bar size based on data density
        const candleWidth = Math.max(6, Math.min(16, Math.floor(800 / chartData.length)));
        return (
          <Bar
            dataKey="candleBody"
            barSize={candleWidth}
            shape={<CandlestickShape />}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
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
          tickFormatter={(value) => {
            const date = new Date(value);
            if (timeRange === '1d') {
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            if (timeRange === '5d') {
              return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getHours().toString().padStart(2, '0')}:00`;
            }
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
          minTickGap={30}
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
