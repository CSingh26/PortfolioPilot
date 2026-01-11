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

type FrontierPoint = {
  expected_return: number;
  expected_vol: number;
};

type FrontierChartCardProps = {
  title: string;
  subtitle: string;
  data: FrontierPoint[];
};

export default function FrontierChartCard({ title, subtitle, data }: FrontierChartCardProps) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="expected_vol"
              tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="expected_return"
              tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip
              formatter={(value: number, name) =>
                name === 'expected_return'
                  ? `${(value * 100).toFixed(2)}%`
                  : `${(value * 100).toFixed(2)}%`
              }
              labelFormatter={() => 'Frontier'}
            />
            <Line
              type="monotone"
              dataKey="expected_return"
              stroke="#1E3A8A"
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
