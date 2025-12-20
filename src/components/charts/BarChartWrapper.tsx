'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarConfig {
  dataKey: string
  fill: string
  name: string
}

interface Props<T extends object = Record<string, unknown>> {
  data: T[]
  bars: BarConfig[]
  xAxisKey?: string
  height?: number
}

export default function BarChartWrapper<T extends object>({
  data,
  bars,
  xAxisKey = 'source',
  height = 280,
}: Props<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} name={bar.name} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
