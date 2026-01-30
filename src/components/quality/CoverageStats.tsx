'use client'

import { CoverageStats as CoverageStatsType } from '@/types/quality'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

interface Props {
  data: CoverageStatsType[]
}

export default function CoverageStats({ data }: Props) {
  const pieData = data.map((item) => ({
    name: item.field,
    value: Number((item.coverage_rate * 100).toFixed(2)),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={90} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div
            key={item.field}
            className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-900">{item.field}</span>
            </div>
            <div className="text-sm text-gray-700">
              {(item.coverage_rate * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





