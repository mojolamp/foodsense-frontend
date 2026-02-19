/**
 * CrawlControlPanel Component Tests
 * Enhanced with auto-tracking
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

// Mock hooks
const mockCrawlProductMutate = vi.fn()
const mockCrawlSearchMutate = vi.fn()
const mockCrawlAllSitesMutate = vi.fn()
const mockCrawlScheduledMutate = vi.fn()
const mockProbeMutate = vi.fn()
const mockValidateQualityMutate = vi.fn()

vi.mock('@/hooks/useCrawlerRaw', () => ({
  useCrawlerList: () => ({
    data: { crawlers: ['pchome', 'momoshop'], total: 2 },
    isLoading: false,
  }),
  useCrawlProduct: () => ({ mutate: mockCrawlProductMutate, isPending: false }),
  useCrawlSearch: () => ({ mutate: mockCrawlSearchMutate, isPending: false }),
  useCrawlAllSites: () => ({ mutate: mockCrawlAllSitesMutate, isPending: false }),
  useCrawlScheduled: () => ({ mutate: mockCrawlScheduledMutate, isPending: false }),
  useCrawlerProbe: () => ({ mutate: mockProbeMutate, isPending: false }),
  useCrawlerValidateQuality: () => ({
    mutate: mockValidateQualityMutate,
    isPending: false,
    data: null,
  }),
}))

// Mock ActiveTaskTracker
vi.mock('@/components/crawler/ActiveTaskTracker', () => ({
  default: ({ taskId, label, onDismiss }: { taskId: string; label: string; onDismiss: () => void }) => (
    <div data-testid={`active-task-${taskId}`}>
      <span>{label}</span>
      <button onClick={onDismiss} data-testid={`dismiss-${taskId}`}>Dismiss</button>
    </div>
  ),
}))

// Mock TaskStatusLookup
vi.mock('@/components/crawler/TaskStatusLookup', () => ({
  default: () => <div data-testid="task-status-lookup">Task Status Lookup</div>,
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Globe: () => <span>🌐</span>,
  Search: () => <span>🔍</span>,
  Layers: () => <span>📚</span>,
  CalendarClock: () => <span>📅</span>,
  Radar: () => <span>📡</span>,
  ShieldCheck: () => <span>🛡</span>,
}))

// Mock UI
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: {
    children: React.ReactNode; onClick?: () => void; disabled?: boolean
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}))

import CrawlControlPanel from '@/components/crawler/CrawlControlPanel'

describe('CrawlControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Control Cards', () => {
    it('應該顯示 Crawl Product URL 區塊', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByText('Crawl Product URL')).toBeInTheDocument()
    })

    it('應該顯示 Search Crawl 區塊', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByText('Search Crawl')).toBeInTheDocument()
    })

    it('應該顯示 All Sites Crawl 區塊', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByText('All Sites Crawl')).toBeInTheDocument()
    })

    it('應該顯示 Scheduled Crawl 區塊', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByText('Scheduled Crawl')).toBeInTheDocument()
    })

    it('應該顯示 Probe 區塊', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByText('Probe')).toBeInTheDocument()
    })

    it('應該顯示 Quality Validate 區塊', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByText('Quality Validate')).toBeInTheDocument()
    })

    it('應該顯示 TaskStatusLookup', () => {
      render(<CrawlControlPanel />)
      expect(screen.getByTestId('task-status-lookup')).toBeInTheDocument()
    })
  })

  describe('Site Selectors', () => {
    it('應該在下拉選單中顯示可用的 sites', () => {
      render(<CrawlControlPanel />)
      const selects = screen.getAllByDisplayValue('Select site...')
      expect(selects.length).toBeGreaterThan(0)
    })
  })

  describe('Auto-tracking', () => {
    it('初始不應有 active tasks', () => {
      render(<CrawlControlPanel />)
      expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument()
    })

    it('Probe 提交後應該觸發 auto-tracking', () => {
      render(<CrawlControlPanel />)

      // Find Run Probe button and click
      const probeBtn = screen.getByText('Run Probe')
      fireEvent.click(probeBtn)

      // Verify mutation was called with onSuccess callback
      expect(mockProbeMutate).toHaveBeenCalledTimes(1)
      const call = mockProbeMutate.mock.calls[0]
      expect(call[0]).toEqual({}) // empty params
      expect(call[1]).toHaveProperty('onSuccess')

      // Simulate onSuccess callback (state update → wrap in act)
      const onSuccess = call[1].onSuccess
      act(() => {
        onSuccess({ task_id: 'probe-task-123' })
      })

      // Now ActiveTaskTracker should appear
      expect(screen.getByTestId('active-task-probe-task-123')).toBeInTheDocument()
      expect(screen.getByText('Health Probe')).toBeInTheDocument()
    })

    it('dismiss 應該移除 active task', () => {
      render(<CrawlControlPanel />)

      // Trigger probe
      const probeBtn = screen.getByText('Run Probe')
      fireEvent.click(probeBtn)

      // Simulate onSuccess (state update → wrap in act)
      const onSuccess = mockProbeMutate.mock.calls[0][1].onSuccess
      act(() => {
        onSuccess({ task_id: 'probe-task-456' })
      })

      expect(screen.getByTestId('active-task-probe-task-456')).toBeInTheDocument()

      // Click dismiss
      fireEvent.click(screen.getByTestId('dismiss-probe-task-456'))

      expect(screen.queryByTestId('active-task-probe-task-456')).not.toBeInTheDocument()
    })

    it('All Sites 提交後應該觸發 auto-tracking', () => {
      render(<CrawlControlPanel />)

      // Type keyword
      const kwInput = screen.getAllByPlaceholderText('Keyword...')[1] // Second one is All Sites
      fireEvent.change(kwInput, { target: { value: '豆腐' } })

      // Find Crawl All button
      const crawlAllBtn = screen.getByText('Crawl All')
      fireEvent.click(crawlAllBtn)

      expect(mockCrawlAllSitesMutate).toHaveBeenCalledTimes(1)
      const call = mockCrawlAllSitesMutate.mock.calls[0]
      expect(call[0]).toEqual({ keyword: '豆腐' })
      expect(call[1]).toHaveProperty('onSuccess')
    })
  })
})
