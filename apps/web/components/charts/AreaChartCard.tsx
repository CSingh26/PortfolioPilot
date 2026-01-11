'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Panel from '../Panel';

type SeriesPoint = {
  date: string;
  value: number;
};

type AreaChartCardProps = {
  title: string;
  subtitle: string;
  data: SeriesPoint[];
  color?: string;
  valueFormatter?: (value: number) => string;
};

export default function AreaChartCard({
  title,
  subtitle,
  data,
  color = '#1E3A8A',
  valueFormatter
}: AreaChartCardProps) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
              width={48}
            />
            <Tooltip
              formatter={(value: number) =>
                valueFormatter ? valueFormatter(value) : value.toFixed(3)
              }
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`${color}1A`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
