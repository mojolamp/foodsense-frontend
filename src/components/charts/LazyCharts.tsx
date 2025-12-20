'use client'

import dynamic from 'next/dynamic'

// 使用動態導入整個圖表組件，而非個別 recharts 組件
export const LazyLineChart = dynamic(
  () => import('./LineChartWrapper'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] animate-pulse bg-gray-100 rounded" />
  }
)

export const LazyBarChart = dynamic(
  () => import('./BarChartWrapper'),
  {
    ssr: false,
    loading: () => <div className="h-[280px] animate-pulse bg-gray-100 rounded" />
  }
)

export const LazyPieChart = dynamic(
  () => import('./PieChartWrapper'),
  {
    ssr: false,
    loading: () => <div className="h-[260px] animate-pulse bg-gray-100 rounded" />
  }
)
