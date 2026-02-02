/**
 * QualityKPICards Component Tests
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QualityKPICards from '@/components/quality/QualityKPICards'
import { QualityOverview } from '@/types/quality'

const mockData: QualityOverview = {
  golden_record_count: 150,
  tier_a_count: 80,
  tier_b_count: 50,
  tier_c_count: 20,
  total_products: 300,
  avg_source_support: 3.5,
  ingredient_coverage_rate: 0.85,
  recent_rules_count: 12,
  recent_corrections_count: 45,
}

describe('QualityKPICards', () => {
  it('應該顯示 Golden Records 數量', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('應該顯示 Golden Records 標籤', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('Golden Records')).toBeInTheDocument()
  })

  it('應該顯示 Tier A 數量', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('Tier A: 80')).toBeInTheDocument()
  })

  it('應該顯示平均來源支持度', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('3.5')).toBeInTheDocument()
    expect(screen.getByText('平均來源支持度')).toBeInTheDocument()
  })

  it('應該顯示成分覆蓋率', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('85.0%')).toBeInTheDocument()
    expect(screen.getByText('成分覆蓋率')).toBeInTheDocument()
  })

  it('應該顯示近 7 日新規則數量', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('近 7 日新規則')).toBeInTheDocument()
  })

  it('應該顯示校正次數', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('45 次校正')).toBeInTheDocument()
  })

  it('應該渲染 4 個 KPI 卡片', () => {
    const { container } = render(<QualityKPICards data={mockData} />)
    const cards = container.querySelectorAll('.bg-white.rounded-lg')
    expect(cards.length).toBe(4)
  })

  it('應該顯示所有圖標', () => {
    render(<QualityKPICards data={mockData} />)
    expect(screen.getByText('⭐')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('🎯')).toBeInTheDocument()
    expect(screen.getByText('🔧')).toBeInTheDocument()
  })

  it('應該有正確的顏色類別', () => {
    const { container } = render(<QualityKPICards data={mockData} />)
    expect(container.querySelector('.bg-blue-100')).toBeInTheDocument()
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument()
    expect(container.querySelector('.bg-purple-100')).toBeInTheDocument()
    expect(container.querySelector('.bg-orange-100')).toBeInTheDocument()
  })

  it('應該使用網格佈局', () => {
    const { container } = render(<QualityKPICards data={mockData} />)
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('應該處理 0% 覆蓋率', () => {
    const zeroData: QualityOverview = {
      ...mockData,
      ingredient_coverage_rate: 0,
    }
    render(<QualityKPICards data={zeroData} />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('應該處理 100% 覆蓋率', () => {
    const fullData: QualityOverview = {
      ...mockData,
      ingredient_coverage_rate: 1,
    }
    render(<QualityKPICards data={fullData} />)
    expect(screen.getByText('100.0%')).toBeInTheDocument()
  })
})
