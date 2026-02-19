/**
 * ScheduleManager Component Tests
 * Schedule CRUD panel
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

const defaultSchedules = [
  {
    schedule_id: 'sched-001',
    site_name: 'pchome',
    cron_expression: '0 2 * * *',
    max_products: 100,
    enabled: true,
    created_at: '2026-02-01T00:00:00Z',
    type: 'recurring' as const,
  },
  {
    schedule_id: 'sched-002',
    site_name: 'momoshop',
    cron_expression: null,
    max_products: 50,
    enabled: false,
    created_at: '2026-02-10T00:00:00Z',
    type: 'immediate' as const,
  },
]

const mockMutate = vi.fn()
let mockSchedulesData: { schedules: typeof defaultSchedules; total: number } = {
  schedules: defaultSchedules,
  total: 2,
}

vi.mock('@/hooks/useCrawlerRaw', () => ({
  useCrawlerList: () => ({
    data: { crawlers: ['pchome', 'momoshop', 'carrefour'], total: 3 },
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useCrawlerAdmin', () => ({
  useCrawlerSchedules: () => ({
    data: mockSchedulesData,
    isLoading: false,
  }),
  useCreateCrawlerSchedule: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CalendarClock: () => <span data-testid="icon-calendar">📅</span>,
  Plus: () => <span data-testid="icon-plus">+</span>,
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    size?: string
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

import ScheduleManager from '@/components/crawler/ScheduleManager'

describe('ScheduleManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Header', () => {
    it('應該顯示 Crawler Schedules 標題', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('Crawler Schedules')).toBeInTheDocument()
    })

    it('應該顯示 schedule 數量 badge', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('應該顯示 New Schedule 按鈕', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('New Schedule')).toBeInTheDocument()
    })
  })

  describe('Schedule List', () => {
    it('應該顯示 pchome schedule', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('pchome')).toBeInTheDocument()
    })

    it('應該顯示 momoshop schedule', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('momoshop')).toBeInTheDocument()
    })

    it('有 cron 的 schedule 應該顯示 cron expression', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('0 2 * * *')).toBeInTheDocument()
    })

    it('沒有 cron 的 schedule 應該顯示 type badge', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('immediate')).toBeInTheDocument()
    })

    it('應該顯示 max products', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('max 100')).toBeInTheDocument()
      expect(screen.getByText('max 50')).toBeInTheDocument()
    })

    it('enabled schedule 應該有 enabled badge', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('enabled')).toBeInTheDocument()
    })

    it('disabled schedule 應該有 disabled badge', () => {
      render(<ScheduleManager />)
      expect(screen.getByText('disabled')).toBeInTheDocument()
    })
  })

  describe('Create Form', () => {
    it('點擊 New Schedule 應該顯示建立表單', () => {
      render(<ScheduleManager />)
      fireEvent.click(screen.getByText('New Schedule'))
      expect(screen.getByText('Site')).toBeInTheDocument()
      expect(screen.getByText('Cron Expression (optional)')).toBeInTheDocument()
      expect(screen.getByText('Max Products')).toBeInTheDocument()
    })

    it('應該顯示 site 下拉選單', () => {
      render(<ScheduleManager />)
      fireEvent.click(screen.getByText('New Schedule'))
      const select = screen.getByDisplayValue('Select site...')
      // Change to pchome
      fireEvent.change(select, { target: { value: 'pchome' } })
      expect(select).toHaveValue('pchome')
    })

    it('應該顯示 enabled checkbox', () => {
      render(<ScheduleManager />)
      fireEvent.click(screen.getByText('New Schedule'))
      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('選擇 site 後點擊 Create Schedule 應該呼叫 mutate', () => {
      render(<ScheduleManager />)
      fireEvent.click(screen.getByText('New Schedule'))

      // Select site
      const select = screen.getByDisplayValue('Select site...')
      fireEvent.change(select, { target: { value: 'carrefour' } })

      // Set cron
      const cronInput = screen.getByPlaceholderText('0 2 * * * (daily at 2am)')
      fireEvent.change(cronInput, { target: { value: '0 3 * * 1' } })

      // Click Create
      fireEvent.click(screen.getByText('Create Schedule'))

      expect(mockMutate).toHaveBeenCalledWith(
        {
          site_name: 'carrefour',
          cron_expression: '0 3 * * 1',
          max_products: 100,
          enabled: true,
        },
        expect.any(Object)
      )
    })

    it('沒有選 site 時 Create 按鈕應該 disabled', () => {
      render(<ScheduleManager />)
      fireEvent.click(screen.getByText('New Schedule'))
      const createBtn = screen.getByText('Create Schedule')
      expect(createBtn).toHaveAttribute('disabled')
    })

    it('再次點擊 Cancel 應該隱藏表單', () => {
      render(<ScheduleManager />)
      fireEvent.click(screen.getByText('New Schedule'))
      expect(screen.getByText('Site')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Cancel'))
      expect(screen.queryByText('Site')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('沒有 schedules 時應該顯示空狀態', () => {
      // Override the module-level variable
      mockSchedulesData = { schedules: [], total: 0 }

      render(<ScheduleManager />)
      expect(screen.getByText('No Schedules')).toBeInTheDocument()
      expect(screen.getByText('Create a schedule to automate crawler runs.')).toBeInTheDocument()

      // Restore for other tests
      mockSchedulesData = { schedules: defaultSchedules, total: 2 }
    })
  })
})
