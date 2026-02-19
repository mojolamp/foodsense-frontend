/**
 * CrawlerAdminPage Tests
 * 5-tab page wiring verification
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

// Mock all hooks used by the page
vi.mock('@/hooks/useCrawlerAdmin', () => ({
  useRepairStats: () => ({
    data: { stats: { pending: 3, approved: 10, rejected: 2, avg_confidence: 0.85 } },
    isLoading: false,
  }),
  useRepairs: () => ({
    data: { repairs: [] },
    isLoading: false,
  }),
  useApproveRepair: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectRepair: () => ({ mutate: vi.fn(), isPending: false }),
}))

// Mock sub-components
vi.mock('@/components/crawler/CrawlerStatusStrip', () => ({
  default: () => <div data-testid="crawler-status-strip">Status Strip</div>,
}))

vi.mock('@/components/crawler/CrawlControlPanel', () => ({
  default: () => <div data-testid="crawl-control-panel">Crawl Control Panel</div>,
}))

vi.mock('@/components/crawler/PipelineLaunchPanel', () => ({
  default: () => <div data-testid="pipeline-launch-panel">Pipeline Launch Panel</div>,
}))

vi.mock('@/components/crawler/CrawlerHealthDashboard', () => ({
  default: () => <div data-testid="crawler-health-dashboard">Health Dashboard</div>,
}))

vi.mock('@/components/crawler/ScheduleManager', () => ({
  default: () => <div data-testid="schedule-manager">Schedule Manager</div>,
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  CheckCircle: () => <span>✓</span>,
  XCircle: () => <span>✗</span>,
  ChevronDown: () => <span>▼</span>,
  ChevronRight: () => <span>►</span>,
  Code: () => <span>‹/›</span>,
  Globe: () => <span>🌐</span>,
  Wrench: () => <span>🔧</span>,
  Rocket: () => <span>🚀</span>,
  Activity: () => <span>📈</span>,
  CalendarClock: () => <span>📅</span>,
}))

// Mock UI
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: {
    children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: string
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>{children}</button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}))

import CrawlerAdminPage from '@/app/(dashboard)/operations/crawler/page'

describe('CrawlerAdminPage', () => {
  describe('Page Header', () => {
    it('應該顯示 Crawler Admin 標題', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText('Crawler Admin')).toBeInTheDocument()
    })

    it('應該顯示描述文字', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText(/pipeline orchestration/)).toBeInTheDocument()
    })

    it('應該渲染 CrawlerStatusStrip', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByTestId('crawler-status-strip')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation — 5 tabs', () => {
    it('應該顯示 Crawl Control tab', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText('Crawl Control')).toBeInTheDocument()
    })

    it('應該顯示 Pipeline tab', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText('Pipeline')).toBeInTheDocument()
    })

    it('應該顯示 Health tab', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText('Health')).toBeInTheDocument()
    })

    it('應該顯示 Schedules tab', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText('Schedules')).toBeInTheDocument()
    })

    it('應該顯示 DOM Repairs tab', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByText('DOM Repairs')).toBeInTheDocument()
    })

    it('DOM Repairs tab 應該顯示 pending count badge', () => {
      render(<CrawlerAdminPage />)
      // The badge with "3" for pending repairs
      const repairsTab = screen.getByText('DOM Repairs').closest('button')
      expect(repairsTab?.querySelector('[data-testid="badge"]')).toBeTruthy()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Tab Content Switching', () => {
    it('預設應該顯示 CrawlControlPanel', () => {
      render(<CrawlerAdminPage />)
      expect(screen.getByTestId('crawl-control-panel')).toBeInTheDocument()
    })

    it('預設不應該顯示其他 panels', () => {
      render(<CrawlerAdminPage />)
      expect(screen.queryByTestId('pipeline-launch-panel')).not.toBeInTheDocument()
      expect(screen.queryByTestId('crawler-health-dashboard')).not.toBeInTheDocument()
      expect(screen.queryByTestId('schedule-manager')).not.toBeInTheDocument()
    })

    it('點擊 Pipeline tab 應該顯示 PipelineLaunchPanel', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('Pipeline'))
      expect(screen.getByTestId('pipeline-launch-panel')).toBeInTheDocument()
      expect(screen.queryByTestId('crawl-control-panel')).not.toBeInTheDocument()
    })

    it('點擊 Health tab 應該顯示 CrawlerHealthDashboard', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('Health'))
      expect(screen.getByTestId('crawler-health-dashboard')).toBeInTheDocument()
    })

    it('點擊 Schedules tab 應該顯示 ScheduleManager', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('Schedules'))
      expect(screen.getByTestId('schedule-manager')).toBeInTheDocument()
    })

    it('點擊 DOM Repairs tab 應該顯示 repair stats', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('DOM Repairs'))
      // Should see stats cards
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })

    it('tab 切換回 Crawl Control 應該恢復原始內容', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('Pipeline'))
      expect(screen.queryByTestId('crawl-control-panel')).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Crawl Control'))
      expect(screen.getByTestId('crawl-control-panel')).toBeInTheDocument()
    })
  })

  describe('DOM Repairs Tab', () => {
    it('應該顯示 repair stats 卡片', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('DOM Repairs'))
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
      expect(screen.getByText('Avg Confidence')).toBeInTheDocument()
    })

    it('空的 repairs list 應該顯示 No Pending Repairs', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('DOM Repairs'))
      expect(screen.getByText('No Pending Repairs')).toBeInTheDocument()
    })

    it('應該顯示 stats 數值', () => {
      render(<CrawlerAdminPage />)
      fireEvent.click(screen.getByText('DOM Repairs'))
      expect(screen.getByText('10')).toBeInTheDocument() // approved count
      expect(screen.getByText('85%')).toBeInTheDocument() // avg confidence
    })
  })
})
