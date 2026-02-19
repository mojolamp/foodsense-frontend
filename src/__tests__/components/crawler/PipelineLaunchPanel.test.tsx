/**
 * PipelineLaunchPanel Component Tests
 * Full pipeline configuration + launch wizard
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

// Mock hooks
const mockStart = vi.fn()
const mockAbort = vi.fn()
const mockReset = vi.fn()

const idleState = {
  status: 'idle' as const,
  config: null,
  currentPhase: null,
  phases: [
    { phase: 'preflight', status: 'pending', checks: [] },
    { phase: 'probe', status: 'pending', checks: [] },
    { phase: 'pilot', status: 'pending', checks: [] },
    { phase: 'batch', status: 'pending', checks: [] },
    { phase: 'verify', status: 'pending', checks: [] },
  ],
}

vi.mock('@/hooks/useCrawlerPipeline', () => ({
  usePipelineRun: () => ({
    state: idleState,
    start: mockStart,
    abort: mockAbort,
    reset: mockReset,
  }),
}))

vi.mock('@/hooks/useCrawlerRaw', () => ({
  useCrawlerList: () => ({
    data: { crawlers: ['pchome', 'momoshop', 'carrefour'], total: 3 },
    isLoading: false,
  }),
}))

// Mock sub-components
vi.mock('@/components/crawler/PipelinePhaseCard', () => ({
  default: ({ result }: { result: { phase: string; status: string } }) => (
    <div data-testid={`phase-card-${result.phase}`}>
      {result.phase}: {result.status}
    </div>
  ),
}))

vi.mock('@/components/crawler/PresetPicker', () => ({
  default: ({ onLoad }: { onLoad: (p: unknown) => void }) => (
    <div data-testid="preset-picker">
      <button onClick={() => onLoad({ keywords: ['preset-kw'], sites: ['preset-site'], limitPerKeyword: 99 })}>
        Load Preset
      </button>
    </div>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Rocket: () => <span data-testid="icon-rocket">🚀</span>,
  Square: () => <span data-testid="icon-square">■</span>,
  RotateCcw: () => <span data-testid="icon-reset">↺</span>,
  FlaskConical: () => <span data-testid="icon-flask">⚗</span>,
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

import PipelineLaunchPanel from '@/components/crawler/PipelineLaunchPanel'

describe('PipelineLaunchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Configuration Form', () => {
    it('應該顯示 Pipeline Configuration 標題', () => {
      render(<PipelineLaunchPanel />)
      expect(screen.getByText('Pipeline Configuration')).toBeInTheDocument()
    })

    it('應該顯示 keywords textarea', () => {
      render(<PipelineLaunchPanel />)
      expect(screen.getByPlaceholderText('豆腐, 牛奶, 醬油...')).toBeInTheDocument()
    })

    it('應該顯示可選的 sites 按鈕', () => {
      render(<PipelineLaunchPanel />)
      expect(screen.getByText('pchome')).toBeInTheDocument()
      expect(screen.getByText('momoshop')).toBeInTheDocument()
      expect(screen.getByText('carrefour')).toBeInTheDocument()
    })

    it('輸入 keywords 後應該顯示 badge 預覽', () => {
      render(<PipelineLaunchPanel />)
      const textarea = screen.getByPlaceholderText('豆腐, 牛奶, 醬油...')
      fireEvent.change(textarea, { target: { value: '醬油, 味噌' } })
      expect(screen.getByText('醬油')).toBeInTheDocument()
      expect(screen.getByText('味噌')).toBeInTheDocument()
    })

    it('點擊 site 按鈕應該切換選取狀態', () => {
      render(<PipelineLaunchPanel />)
      const pchomeBtn = screen.getByText('pchome')
      fireEvent.click(pchomeBtn)
      // Should now have selected styling (bg-primary)
      expect(pchomeBtn.className).toContain('bg-primary')
    })

    it('應該顯示 limit per keyword 輸入', () => {
      render(<PipelineLaunchPanel />)
      const limitInput = screen.getByDisplayValue('5')
      expect(limitInput).toBeInTheDocument()
    })

    it('應該顯示 PresetPicker', () => {
      render(<PipelineLaunchPanel />)
      expect(screen.getByTestId('preset-picker')).toBeInTheDocument()
    })
  })

  describe('Launch Actions', () => {
    it('沒有 keywords 時 Launch 和 Dry Run 應該 disabled', () => {
      render(<PipelineLaunchPanel />)
      const buttons = screen.getAllByTestId('button')
      const launchBtn = buttons.find((b) => b.textContent?.includes('Launch Pipeline'))
      const dryRunBtn = buttons.find((b) => b.textContent?.includes('Dry Run'))
      expect(launchBtn).toHaveAttribute('disabled')
      expect(dryRunBtn).toHaveAttribute('disabled')
    })

    it('有 keywords 時 Launch 和 Dry Run 應該 enabled', () => {
      render(<PipelineLaunchPanel />)
      const textarea = screen.getByPlaceholderText('豆腐, 牛奶, 醬油...')
      fireEvent.change(textarea, { target: { value: '豆腐' } })

      const buttons = screen.getAllByTestId('button')
      const launchBtn = buttons.find((b) => b.textContent?.includes('Launch Pipeline'))
      const dryRunBtn = buttons.find((b) => b.textContent?.includes('Dry Run'))
      expect(launchBtn).not.toHaveAttribute('disabled')
      expect(dryRunBtn).not.toHaveAttribute('disabled')
    })

    it('點擊 Launch Pipeline 應該呼叫 start(dryRun=false)', () => {
      render(<PipelineLaunchPanel />)
      const textarea = screen.getByPlaceholderText('豆腐, 牛奶, 醬油...')
      fireEvent.change(textarea, { target: { value: '豆腐' } })

      const buttons = screen.getAllByTestId('button')
      const launchBtn = buttons.find((b) => b.textContent?.includes('Launch Pipeline'))
      if (launchBtn) fireEvent.click(launchBtn)

      expect(mockStart).toHaveBeenCalledWith({
        keywords: ['豆腐'],
        sites: [],
        limitPerKeyword: 5,
        dryRun: false,
      })
    })

    it('點擊 Dry Run 應該呼叫 start(dryRun=true)', () => {
      render(<PipelineLaunchPanel />)
      const textarea = screen.getByPlaceholderText('豆腐, 牛奶, 醬油...')
      fireEvent.change(textarea, { target: { value: '牛奶' } })

      const buttons = screen.getAllByTestId('button')
      const dryRunBtn = buttons.find((b) => b.textContent?.includes('Dry Run'))
      if (dryRunBtn) fireEvent.click(dryRunBtn)

      expect(mockStart).toHaveBeenCalledWith({
        keywords: ['牛奶'],
        sites: [],
        limitPerKeyword: 5,
        dryRun: true,
      })
    })

    it('選擇 sites 後 Launch 應該包含 sites', () => {
      render(<PipelineLaunchPanel />)
      const textarea = screen.getByPlaceholderText('豆腐, 牛奶, 醬油...')
      fireEvent.change(textarea, { target: { value: '豆腐' } })

      fireEvent.click(screen.getByText('pchome'))
      fireEvent.click(screen.getByText('momoshop'))

      const buttons = screen.getAllByTestId('button')
      const launchBtn = buttons.find((b) => b.textContent?.includes('Launch Pipeline'))
      if (launchBtn) fireEvent.click(launchBtn)

      expect(mockStart).toHaveBeenCalledWith(
        expect.objectContaining({
          sites: ['pchome', 'momoshop'],
        })
      )
    })
  })

  describe('Preset Loading', () => {
    it('從 preset 載入應該更新表單', () => {
      render(<PipelineLaunchPanel />)
      const loadBtn = screen.getByText('Load Preset')
      fireEvent.click(loadBtn)

      // After loading, launch should use preset values
      const buttons = screen.getAllByTestId('button')
      const launchBtn = buttons.find((b) => b.textContent?.includes('Launch Pipeline'))
      if (launchBtn) fireEvent.click(launchBtn)

      expect(mockStart).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: ['preset-kw'],
          sites: ['preset-site'],
          limitPerKeyword: 99,
        })
      )
    })
  })

  describe('Idle State', () => {
    it('idle 狀態不應該顯示 phase cards', () => {
      render(<PipelineLaunchPanel />)
      expect(screen.queryByTestId('phase-card-preflight')).not.toBeInTheDocument()
    })

    it('idle 狀態不應該顯示 status badge', () => {
      render(<PipelineLaunchPanel />)
      // No overall status badge in idle
      expect(screen.queryByText('Idle')).not.toBeInTheDocument()
    })
  })
})
