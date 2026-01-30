'use client'

import { QualityOverview } from '@/types/quality'

interface Props {
  data: QualityOverview
}

export default function QualityKPICards({ data }: Props) {
  const kpis = [
    {
      label: 'Golden Records',
      value: data.golden_record_count,
      subValue: `Tier A: ${data.tier_a_count}`,
      color: 'blue',
      icon: '⭐',
    },
    {
      label: '平均來源支持度',
      value: data.avg_source_support.toFixed(1),
      subValue: '個來源/產品',
      color: 'green',
      icon: '📊',
    },
    {
      label: '成分覆蓋率',
      value: `${(data.ingredient_coverage_rate * 100).toFixed(1)}%`,
      subValue: 'ingredients_structure',
      color: 'purple',
      icon: '🎯',
    },
    {
      label: '近 7 日新規則',
      value: data.recent_rules_count,
      subValue: `${data.recent_corrections_count} 次校正`,
      color: 'orange',
      icon: '🔧',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">{kpi.icon}</span>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${colorClasses[kpi.color as keyof typeof colorClasses]}
            `}>
              {kpi.label}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
          <p className="text-sm text-gray-500 mt-1">{kpi.subValue}</p>
        </div>
      ))}
    </div>
  )
}





