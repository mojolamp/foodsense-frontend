'use client'

import { SourceContribution as SourceContributionType } from '@/types/quality'
import { LazyBarChart } from '@/components/charts/LazyCharts'

interface Props {
  data: SourceContributionType[]
}

const BARS = [
  { dataKey: 'total_products', fill: '#3B82F6', name: '總產品' },
  { dataKey: 'tier_a_adopted', fill: '#10B981', name: 'Tier A' },
]

export default function SourceContribution({ data }: Props) {
  return <LazyBarChart data={data} bars={BARS} xAxisKey="source" height={280} />
}
