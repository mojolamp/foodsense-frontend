import type { Meta, StoryObj } from '@storybook/react'
import LineChartWrapper from '@/components/charts/LineChartWrapper'
import BarChartWrapper from '@/components/charts/BarChartWrapper'
import PieChartWrapper from '@/components/charts/PieChartWrapper'

const lineChartMeta: Meta<typeof LineChartWrapper> = {
  title: 'Charts/LineChart',
  component: LineChartWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default lineChartMeta

type LineChartStory = StoryObj<typeof lineChartMeta>

const sampleTimelineData = [
  { date: '2024-01', golden_records: 100, corrections: 20, rules_created: 5 },
  { date: '2024-02', golden_records: 150, corrections: 35, rules_created: 8 },
  { date: '2024-03', golden_records: 220, corrections: 45, rules_created: 12 },
  { date: '2024-04', golden_records: 310, corrections: 60, rules_created: 15 },
  { date: '2024-05', golden_records: 420, corrections: 75, rules_created: 18 },
  { date: '2024-06', golden_records: 550, corrections: 90, rules_created: 22 },
]

export const Timeline: LineChartStory = {
  args: {
    data: sampleTimelineData,
    lines: [
      { dataKey: 'golden_records', stroke: '#3B82F6', name: 'Golden Records' },
      { dataKey: 'corrections', stroke: '#10B981', name: '校正次數' },
      { dataKey: 'rules_created', stroke: '#F59E0B', name: '新規則' },
    ],
    xAxisKey: 'date',
    height: 300,
  },
}

// Bar Chart Story
export const BarChart: StoryObj<typeof BarChartWrapper> = {
  render: () => {
    const barData = [
      { source: 'FDA', total_products: 1200, tier_a_adopted: 980 },
      { source: 'USDA', total_products: 850, tier_a_adopted: 720 },
      { source: 'OpenFood', total_products: 650, tier_a_adopted: 450 },
      { source: 'Manual', total_products: 300, tier_a_adopted: 280 },
    ]

    return (
      <div className="w-full max-w-2xl">
        <h3 className="mb-4 text-lg font-semibold">來源貢獻度</h3>
        <BarChartWrapper
          data={barData}
          bars={[
            { dataKey: 'total_products', fill: '#3B82F6', name: '總產品' },
            { dataKey: 'tier_a_adopted', fill: '#10B981', name: 'Tier A' },
          ]}
          xAxisKey="source"
          height={280}
        />
      </div>
    )
  },
}

// Pie Chart Story
export const PieChart: StoryObj<typeof PieChartWrapper> = {
  render: () => {
    const pieData = [
      { name: '品名', value: 95.5 },
      { name: '成分', value: 88.2 },
      { name: '營養標示', value: 76.8 },
      { name: '過敏原', value: 65.3 },
      { name: '產地', value: 82.1 },
    ]

    return (
      <div className="w-full max-w-md">
        <h3 className="mb-4 text-lg font-semibold">欄位覆蓋率</h3>
        <PieChartWrapper
          data={pieData}
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          height={260}
        />
      </div>
    )
  },
}
