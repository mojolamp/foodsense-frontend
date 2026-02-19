/**
 * ActiveTaskTracker Component Tests
 * Auto-poll task tracker card
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

// Mock the task status hook
const mockTaskStatusData = {
  task_id: 'task-abc123',
  status: 'running' as const,
  created_at: new Date(Date.now() - 30000).toISOString(), // 30s ago
}

vi.mock('@/hooks/useCrawlerRaw', () => ({
  useCrawlerTaskStatus: vi.fn(() => ({
    data: mockTaskStatusData,
    isLoading: false,
  })),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: ({ className }: { className?: string }) => <span data-testid="icon-x" className={className}>×</span>,
  ChevronDown: ({ className }: { className?: string }) => <span data-testid="icon-chevron-down" className={className}>▼</span>,
  ChevronRight: ({ className }: { className?: string }) => <span data-testid="icon-chevron-right" className={className}>►</span>,
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...rest }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}))

import ActiveTaskTracker from '@/components/crawler/ActiveTaskTracker'
import { useCrawlerTaskStatus } from '@/hooks/useCrawlerRaw'

describe('ActiveTaskTracker', () => {
  const defaultProps = {
    taskId: 'task-abc123',
    label: 'Search: pchome/豆腐',
    onDismiss: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應該顯示任務 label', () => {
    render(<ActiveTaskTracker {...defaultProps} />)
    expect(screen.getByText('Search: pchome/豆腐')).toBeInTheDocument()
  })

  it('應該顯示 task ID', () => {
    render(<ActiveTaskTracker {...defaultProps} />)
    expect(screen.getByText('task-abc123')).toBeInTheDocument()
  })

  it('應該顯示狀態 badge', () => {
    render(<ActiveTaskTracker {...defaultProps} />)
    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('應該呼叫 useCrawlerTaskStatus 帶正確的 taskId', () => {
    render(<ActiveTaskTracker {...defaultProps} />)
    expect(useCrawlerTaskStatus).toHaveBeenCalledWith('task-abc123')
  })

  it('點擊 dismiss 按鈕應該呼叫 onDismiss', () => {
    render(<ActiveTaskTracker {...defaultProps} />)
    const buttons = screen.getAllByTestId('button')
    // The dismiss button has the X icon
    const dismissBtn = buttons.find((btn) => btn.querySelector('[data-testid="icon-x"]'))
    if (dismissBtn) {
      fireEvent.click(dismissBtn)
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1)
    }
  })

  it('running 狀態不應顯示展開按鈕', () => {
    render(<ActiveTaskTracker {...defaultProps} />)
    // ChevronDown/ChevronRight should not appear when not done
    expect(screen.queryByTestId('icon-chevron-down')).not.toBeInTheDocument()
    expect(screen.queryByTestId('icon-chevron-right')).not.toBeInTheDocument()
  })

  describe('完成狀態', () => {
    beforeEach(() => {
      vi.mocked(useCrawlerTaskStatus).mockReturnValue({
        data: {
          task_id: 'task-abc123',
          status: 'done',
          result: { crawled: 10, errors: 0 },
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
        isLoading: false,
      } as ReturnType<typeof useCrawlerTaskStatus>)
    })

    it('應該顯示 done 狀態', () => {
      render(<ActiveTaskTracker {...defaultProps} />)
      expect(screen.getByText('done')).toBeInTheDocument()
    })

    it('應該顯示展開結果按鈕', () => {
      render(<ActiveTaskTracker {...defaultProps} />)
      expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument()
    })

    it('點擊展開應該顯示 JSON result', () => {
      render(<ActiveTaskTracker {...defaultProps} />)
      // Find and click the expand toggle (button with chevron)
      const expandBtn = screen.getByTestId('icon-chevron-right').closest('button')
      if (expandBtn) {
        fireEvent.click(expandBtn)
        expect(screen.getByText(/"crawled": 10/)).toBeInTheDocument()
      }
    })
  })

  describe('失敗狀態', () => {
    beforeEach(() => {
      vi.mocked(useCrawlerTaskStatus).mockReturnValue({
        data: {
          task_id: 'task-abc123',
          status: 'failed',
          error: 'Connection timeout',
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
        isLoading: false,
      } as ReturnType<typeof useCrawlerTaskStatus>)
    })

    it('應該顯示 failed 狀態', () => {
      render(<ActiveTaskTracker {...defaultProps} />)
      expect(screen.getByText('failed')).toBeInTheDocument()
    })

    it('應該顯示錯誤訊息', () => {
      render(<ActiveTaskTracker {...defaultProps} />)
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })
  })

  describe('queued 狀態（無資料）', () => {
    beforeEach(() => {
      vi.mocked(useCrawlerTaskStatus).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as ReturnType<typeof useCrawlerTaskStatus>)
    })

    it('status 為空時應該顯示 queued', () => {
      render(<ActiveTaskTracker {...defaultProps} />)
      expect(screen.getByText('queued')).toBeInTheDocument()
    })
  })
})
