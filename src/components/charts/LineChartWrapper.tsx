'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LineConfig {
  dataKey: string
  stroke: string
  name: string
}

interface Props<T extends object = Record<string, unknown>> {
  data: T[]
  lines: LineConfig[]
  xAxisKey?: string
  height?: number
}

export default function LineChartWrapper<T extends object>({
  data,
  lines,
  xAxisKey = 'date',
  height = 300,
}: Props<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
