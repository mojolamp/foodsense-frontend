/**
 * MetricCard Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Activity } from 'lucide-react'
import MetricCard from '@/components/monitoring/MetricCard'

describe('MetricCard', () => {
  it('應該顯示標題', () => {
    render(<MetricCard title="Total Users" value={1234} icon={Activity} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('應該顯示數值', () => {
    render(<MetricCard title="Count" value={5678} icon={Activity} />)
    expect(screen.getByText('5678')).toBeInTheDocument()
  })

  it('應該顯示字串數值', () => {
    render(<MetricCard title="Status" value="Active" icon={Activity} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('應該顯示副標題當提供時', () => {
    render(
      <MetricCard
        title="Users"
        value={100}
        subtitle="Last 24 hours"
        icon={Activity}
      />
    )
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument()
  })

  it('沒有副標題時不應該渲染副標題區域', () => {
    const { container } = render(
      <MetricCard title="Users" value={100} icon={Activity} />
    )
    // 只有 title 和 value，不應該有第三個 p 元素
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(2) // title + value
  })

  it('應該顯示圖標', () => {
    const { container } = render(
      <MetricCard title="Users" value={100} icon={Activity} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('應該顯示正向趨勢', () => {
    render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        trend={{ value: 15, isPositive: true }}
      />
    )
    expect(screen.getByText(/↑.*15%/)).toBeInTheDocument()
  })

  it('應該顯示負向趨勢', () => {
    render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        trend={{ value: -10, isPositive: false }}
      />
    )
    expect(screen.getByText(/↓.*10%/)).toBeInTheDocument()
  })

  it('正向趨勢應該使用綠色', () => {
    render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        trend={{ value: 15, isPositive: true }}
      />
    )
    const trendElement = screen.getByText(/↑.*15%/)
    expect(trendElement).toHaveClass('text-green-600')
  })

  it('負向趨勢應該使用紅色', () => {
    render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        trend={{ value: 10, isPositive: false }}
      />
    )
    const trendElement = screen.getByText(/↓.*10%/)
    expect(trendElement).toHaveClass('text-red-600')
  })

  it('預設應該使用藍色背景', () => {
    const { container } = render(
      <MetricCard title="Users" value={100} icon={Activity} />
    )
    expect(container.querySelector('.bg-blue-100')).toBeInTheDocument()
  })

  it('應該可以自訂顏色類別', () => {
    const { container } = render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        colorClass="bg-green-100"
      />
    )
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument()
  })

  it('點擊卡片應該呼叫 onClick', () => {
    const onClick = vi.fn()
    render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        onClick={onClick}
      />
    )

    // 找到卡片並點擊
    const card = screen.getByText('Total Users').closest('.p-4') ||
      screen.getByText('Users').closest('div[class*="p-4"]')

    if (card) {
      fireEvent.click(card)
      expect(onClick).toHaveBeenCalledTimes(1)
    }
  })

  it('有 onClick 時應該有 cursor-pointer 樣式', () => {
    const { container } = render(
      <MetricCard
        title="Users"
        value={100}
        icon={Activity}
        onClick={() => {}}
      />
    )
    expect(container.querySelector('.cursor-pointer')).toBeInTheDocument()
  })

  it('沒有 onClick 時不應該有 cursor-pointer 樣式', () => {
    const { container } = render(
      <MetricCard title="Users" value={100} icon={Activity} />
    )
    expect(container.querySelector('.cursor-pointer')).not.toBeInTheDocument()
  })
})
