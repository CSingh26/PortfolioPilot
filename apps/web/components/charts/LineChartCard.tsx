'use client';

import {
  Line,
  LineChart,
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

type LineChartCardProps = {
  title: string;
  subtitle: string;
  data: SeriesPoint[];
  color?: string;
  valueFormatter?: (value: number) => string;
};

export default function LineChartCard({
  title,
  subtitle,
  data,
  color = '#1E3A8A',
  valueFormatter
}: LineChartCardProps) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
