'use client'

import { CoverageStats as CoverageStatsType } from '@/types/quality'
import { LazyPieChart } from '@/components/charts/LazyCharts'

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
      <LazyPieChart data={pieData} colors={COLORS} height={260} />
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
