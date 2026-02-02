/**
 * ErrorState Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorState from '@/components/shared/ErrorState'

describe('ErrorState', () => {
  it('應該顯示錯誤訊息', () => {
    render(<ErrorState message="Something went wrong" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('預設應該顯示 "Error" 標題', () => {
    render(<ErrorState message="Error occurred" />)

    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('應該顯示自訂標題', () => {
    render(<ErrorState title="Connection Failed" message="Unable to connect" />)

    expect(screen.getByText('Connection Failed')).toBeInTheDocument()
  })

  it('應該顯示錯誤圖標', () => {
    render(<ErrorState message="Error" />)

    // AlertCircle 圖標應該存在
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('應該在提供 onRetry 時顯示重試按鈕', () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Error" onRetry={onRetry} />)

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('沒有 onRetry 時不應該顯示重試按鈕', () => {
    render(<ErrorState message="Error" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('點擊重試按鈕應該呼叫 onRetry', () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Error" onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('重試按鈕應該有重新整理圖標', () => {
    render(<ErrorState message="Error" onRetry={() => {}} />)

    const button = screen.getByRole('button')
    // 按鈕內應該有 SVG 圖標
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('應該正確套用樣式類別', () => {
    render(<ErrorState message="Test error" />)

    const title = screen.getByText('Error')
    expect(title).toHaveClass('text-lg', 'font-semibold')

    const message = screen.getByText('Test error')
    expect(message).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('應該正確顯示所有元素', () => {
    const onRetry = vi.fn()
    render(
      <ErrorState
        title="Network Error"
        message="Failed to fetch data"
        onRetry={onRetry}
      />
    )

    expect(screen.getByText('Network Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
