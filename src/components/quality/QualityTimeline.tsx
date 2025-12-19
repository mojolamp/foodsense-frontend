'use client'

import { TimelineData } from '@/types/quality'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  data: TimelineData[]
}

export default function QualityTimeline({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="golden_records"
          stroke="#3B82F6"
          name="Golden Records"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="corrections"
          stroke="#10B981"
          name="校正次數"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="rules_created"
          stroke="#F59E0B"
          name="新規則"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


