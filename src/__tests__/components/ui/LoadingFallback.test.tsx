/**
 * LoadingFallback Components Tests
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  SpinnerLoader,
  ModalSkeleton,
  TableSkeleton,
  ChartSkeleton,
  CardSkeleton,
  DrawerSkeleton,
  PageSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  FormSkeleton,
  PageLoader,
  InlineLoader,
  ShimmerEffect,
} from '@/components/ui/LoadingFallback'

describe('SpinnerLoader', () => {
  it('應該渲染 spinner', () => {
    const { container } = render(<SpinnerLoader />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('size=sm 應該使用小尺寸', () => {
    const { container } = render(<SpinnerLoader size="sm" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-4', 'w-4', 'border-2')
  })

  it('size=md 應該使用中尺寸', () => {
    const { container } = render(<SpinnerLoader size="md" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-8', 'w-8', 'border-4')
  })

  it('size=lg 應該使用大尺寸', () => {
    const { container } = render(<SpinnerLoader size="lg" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12', 'w-12', 'border-4')
  })

  it('預設應該使用中尺寸', () => {
    const { container } = render(<SpinnerLoader />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-8', 'w-8')
  })
})

describe('ModalSkeleton', () => {
  it('應該渲染 modal skeleton', () => {
    const { container } = render(<ModalSkeleton />)
    expect(container.querySelector('.fixed')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('應該有背景遮罩', () => {
    const { container } = render(<ModalSkeleton />)
    const overlay = container.querySelector('.bg-black\\/50')
    expect(overlay).toBeInTheDocument()
  })
})

describe('TableSkeleton', () => {
  it('預設應該渲染 10 行', () => {
    const { container } = render(<TableSkeleton />)
    const rows = container.querySelectorAll('.flex.gap-4.mb-3')
    expect(rows.length).toBe(10)
  })

  it('應該可以自訂行數', () => {
    const { container } = render(<TableSkeleton rows={5} />)
    const rows = container.querySelectorAll('.flex.gap-4.mb-3')
    expect(rows.length).toBe(5)
  })

  it('應該有表頭', () => {
    const { container } = render(<TableSkeleton />)
    const header = container.querySelector('.border-b')
    expect(header).toBeInTheDocument()
  })
})

describe('ChartSkeleton', () => {
  it('應該渲染 chart skeleton', () => {
    const { container } = render(<ChartSkeleton />)
    expect(container.querySelector('.bg-gray-50')).toBeInTheDocument()
  })

  it('預設高度應該是 h-64', () => {
    const { container } = render(<ChartSkeleton />)
    expect(container.querySelector('.h-64')).toBeInTheDocument()
  })

  it('應該可以自訂高度', () => {
    const { container } = render(<ChartSkeleton height="h-96" />)
    expect(container.querySelector('.h-96')).toBeInTheDocument()
  })

  it('應該包含 SpinnerLoader', () => {
    const { container } = render(<ChartSkeleton />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

describe('CardSkeleton', () => {
  it('應該渲染 card skeleton', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})

describe('DrawerSkeleton', () => {
  it('應該渲染 drawer skeleton', () => {
    const { container } = render(<DrawerSkeleton />)
    expect(container.querySelector('.fixed')).toBeInTheDocument()
    expect(container.querySelector('.w-96')).toBeInTheDocument()
  })

  it('應該有關閉按鈕區域', () => {
    const { container } = render(<DrawerSkeleton />)
    const closeArea = container.querySelector('.h-6.w-6')
    expect(closeArea).toBeInTheDocument()
  })
})

describe('PageSkeleton', () => {
  it('應該渲染 page skeleton', () => {
    const { container } = render(<PageSkeleton />)
    expect(container.querySelector('.container')).toBeInTheDocument()
  })

  it('應該包含 CardSkeleton', () => {
    const { container } = render(<PageSkeleton />)
    // PageSkeleton 包含 3 個 CardSkeleton
    const cards = container.querySelectorAll('.rounded-lg.shadow')
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })

  it('應該包含 TableSkeleton', () => {
    const { container } = render(<PageSkeleton />)
    // 檢查是否有表格行
    const tableRows = container.querySelectorAll('.flex.gap-4.mb-3')
    expect(tableRows.length).toBeGreaterThan(0)
  })
})

describe('ListItemSkeleton', () => {
  it('應該渲染 list item skeleton', () => {
    const { container } = render(<ListItemSkeleton />)
    expect(container.querySelector('.border-b')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('應該有 avatar 區域', () => {
    const { container } = render(<ListItemSkeleton />)
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })
})

describe('ListSkeleton', () => {
  it('預設應該渲染 5 個項目', () => {
    const { container } = render(<ListSkeleton />)
    const items = container.querySelectorAll('.border-b.animate-pulse')
    expect(items.length).toBe(5)
  })

  it('應該可以自訂項目數', () => {
    const { container } = render(<ListSkeleton items={3} />)
    const items = container.querySelectorAll('.border-b.animate-pulse')
    expect(items.length).toBe(3)
  })
})

describe('FormSkeleton', () => {
  it('應該渲染 form skeleton', () => {
    const { container } = render(<FormSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('應該有多個表單欄位區域', () => {
    const { container } = render(<FormSkeleton />)
    const fields = container.querySelectorAll('.h-10')
    expect(fields.length).toBeGreaterThanOrEqual(2)
  })

  it('應該有 textarea 區域', () => {
    const { container } = render(<FormSkeleton />)
    const textarea = container.querySelector('.h-24')
    expect(textarea).toBeInTheDocument()
  })
})

describe('PageLoader', () => {
  it('預設應該顯示 "Loading..." 訊息', () => {
    render(<PageLoader />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('應該可以自訂訊息', () => {
    render(<PageLoader message="Please wait..." />)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('應該包含 SpinnerLoader', () => {
    const { container } = render(<PageLoader />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('應該是全螢幕置中', () => {
    const { container } = render(<PageLoader />)
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
  })
})

describe('InlineLoader', () => {
  it('應該渲染 inline spinner', () => {
    const { container } = render(<InlineLoader />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  it('應該是 inline-flex', () => {
    const { container } = render(<InlineLoader />)
    expect(container.querySelector('.inline-flex')).toBeInTheDocument()
  })
})

describe('ShimmerEffect', () => {
  it('應該渲染 shimmer effect', () => {
    const { container } = render(<ShimmerEffect />)
    expect(container.querySelector('.bg-gray-200')).toBeInTheDocument()
  })

  it('應該可以自訂 className', () => {
    const { container } = render(<ShimmerEffect className="h-20 w-40" />)
    expect(container.querySelector('.h-20.w-40')).toBeInTheDocument()
  })

  it('應該有 shimmer wrapper', () => {
    const { container } = render(<ShimmerEffect />)
    expect(container.querySelector('.shimmer-wrapper')).toBeInTheDocument()
  })
})
