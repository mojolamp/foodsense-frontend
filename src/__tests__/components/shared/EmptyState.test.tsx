/**
 * EmptyState Component Tests
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'

describe('EmptyState', () => {
  it('應該顯示標題', () => {
    render(<EmptyState title="No results found" />)

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('應該顯示描述當提供時', () => {
    render(
      <EmptyState
        title="No results"
        description="Try adjusting your search criteria"
      />
    )

    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument()
  })

  it('沒有描述時不應該顯示描述區塊', () => {
    const { container } = render(<EmptyState title="Empty" />)

    // 確認沒有 p 標籤（描述區塊）
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('應該顯示圖標當提供時', () => {
    render(<EmptyState icon={Search} title="No search results" />)

    // 檢查 SVG 圖標存在
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('沒有圖標時不應該顯示圖標區塊', () => {
    const { container } = render(<EmptyState title="Empty" />)

    // 確認沒有 SVG
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(0)
  })

  it('應該顯示 action 當提供時', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Create New</button>}
      />
    )

    expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument()
  })

  it('沒有 action 時不應該顯示 action 區塊', () => {
    const { container } = render(<EmptyState title="Empty" />)

    // 確認沒有按鈕
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('應該同時顯示所有元素', () => {
    render(
      <EmptyState
        icon={Search}
        title="No search results"
        description="Try different keywords"
        action={<button>Clear Search</button>}
      />
    )

    expect(document.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('No search results')).toBeInTheDocument()
    expect(screen.getByText('Try different keywords')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear Search' })).toBeInTheDocument()
  })

  it('標題應該使用正確的樣式類別', () => {
    render(<EmptyState title="Test Title" />)

    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('text-lg', 'font-semibold')
  })
})
