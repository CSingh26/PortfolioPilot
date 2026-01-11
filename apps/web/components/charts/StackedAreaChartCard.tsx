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

const palette = ['#1E3A8A', '#2563EB', '#0284C7', '#0F766E', '#64748B'];

type DataPoint = Record<string, number | string>;

type StackedAreaChartCardProps = {
  title: string;
  subtitle: string;
  data: DataPoint[];
  keys: string[];
};

export default function StackedAreaChartCard({
  title,
  subtitle,
  data,
  keys
}: StackedAreaChartCardProps) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <Tooltip />
            {keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="weights"
                stroke={palette[index % palette.length]}
                fill={`${palette[index % palette.length]}33`}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
