'use client'

import { TimelineData } from '@/types/quality'
import { LazyLineChart } from '@/components/charts/LazyCharts'

interface Props {
  data: TimelineData[]
}

const LINES = [
  { dataKey: 'golden_records', stroke: '#3B82F6', name: 'Golden Records' },
  { dataKey: 'corrections', stroke: '#10B981', name: '校正次數' },
  { dataKey: 'rules_created', stroke: '#F59E0B', name: '新規則' },
]

export default function QualityTimeline({ data }: Props) {
  return <LazyLineChart data={data} lines={LINES} xAxisKey="date" height={300} />
}
