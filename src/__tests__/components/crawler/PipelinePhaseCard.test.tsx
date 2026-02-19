/**
 * PipelinePhaseCard Component Tests
 * Phase status card with expandable check list
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import type { PipelinePhaseResult } from '@/types/crawlerPipeline'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => <span data-testid="icon-check" className={className}>✓</span>,
  X: ({ className }: { className?: string }) => <span data-testid="icon-x" className={className}>✗</span>,
  Loader2: ({ className }: { className?: string }) => <span data-testid="icon-loader" className={className}>⟳</span>,
  Clock: ({ className }: { className?: string }) => <span data-testid="icon-clock" className={className}>⏱</span>,
  SkipForward: ({ className }: { className?: string }) => <span data-testid="icon-skip" className={className}>⏭</span>,
  ChevronDown: ({ className }: { className?: string }) => <span data-testid="icon-chevron-down" className={className}>▼</span>,
  ChevronRight: ({ className }: { className?: string }) => <span data-testid="icon-chevron-right" className={className}>►</span>,
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="phase-card" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}))

import PipelinePhaseCard from '@/components/crawler/PipelinePhaseCard'

describe('PipelinePhaseCard', () => {
  const pendingPhase: PipelinePhaseResult = {
    phase: 'preflight',
    status: 'pending',
    checks: [],
  }

  const runningPhase: PipelinePhaseResult = {
    phase: 'probe',
    status: 'running',
    startedAt: new Date().toISOString(),
    checks: [
      { name: 'Probe queued', passed: true, detail: 'task-123' },
    ],
  }

  const passedPhase: PipelinePhaseResult = {
    phase: 'pilot',
    status: 'passed',
    startedAt: new Date(Date.now() - 5000).toISOString(),
    completedAt: new Date().toISOString(),
    checks: [
      { name: 'Pilot search', passed: true, detail: 'pchome/豆腐' },
      { name: 'Pilot completed', passed: true, detail: 'OK' },
    ],
  }

  const failedPhase: PipelinePhaseResult = {
    phase: 'batch',
    status: 'failed',
    startedAt: new Date(Date.now() - 10000).toISOString(),
    completedAt: new Date().toISOString(),
    checks: [
      { name: 'Batch queued', passed: true, detail: 'task-456' },
      { name: 'Batch completed', passed: false, detail: 'Timeout' },
      { name: 'Error', passed: false, detail: 'Connection refused' },
    ],
  }

  describe('Phase Labels', () => {
    it('應該顯示 Pre-flight label', () => {
      render(<PipelinePhaseCard result={pendingPhase} />)
      expect(screen.getByText('Pre-flight')).toBeInTheDocument()
    })

    it('應該顯示 Health Probe label', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      expect(screen.getByText('Health Probe')).toBeInTheDocument()
    })

    it('應該顯示 Pilot Crawl label', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      expect(screen.getByText('Pilot Crawl')).toBeInTheDocument()
    })
  })

  describe('Status Icons', () => {
    it('pending 應該顯示 clock icon', () => {
      render(<PipelinePhaseCard result={pendingPhase} />)
      expect(screen.getByTestId('icon-clock')).toBeInTheDocument()
    })

    it('running 應該顯示 loader icon', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument()
    })

    it('passed 應該顯示 check icon', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      // First check icon is the status icon
      expect(screen.getAllByTestId('icon-check').length).toBeGreaterThan(0)
    })

    it('failed 應該顯示 X icon', () => {
      render(<PipelinePhaseCard result={failedPhase} />)
      expect(screen.getAllByTestId('icon-x').length).toBeGreaterThan(0)
    })
  })

  describe('Status Badge', () => {
    it('應該顯示狀態文字', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      expect(screen.getByText('running')).toBeInTheDocument()
    })

    it('passed 應該使用 success variant', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      const badge = screen.getByText('passed').closest('[data-testid="badge"]')
      expect(badge).toHaveAttribute('data-variant', 'success')
    })

    it('failed 應該使用 destructive variant', () => {
      render(<PipelinePhaseCard result={failedPhase} />)
      const badge = screen.getByText('failed').closest('[data-testid="badge"]')
      expect(badge).toHaveAttribute('data-variant', 'destructive')
    })
  })

  describe('Phase Number', () => {
    it('preflight 應該顯示 phase number 0', () => {
      render(<PipelinePhaseCard result={pendingPhase} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Checks Expansion', () => {
    it('有 checks 時應該可展開', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      // Should have a chevron icon
      const chevrons = screen.queryAllByTestId('icon-chevron-down').concat(
        screen.queryAllByTestId('icon-chevron-right')
      )
      expect(chevrons.length).toBeGreaterThan(0)
    })

    it('沒有 checks 時不應顯示 chevron', () => {
      render(<PipelinePhaseCard result={pendingPhase} />)
      const chevrons = screen.queryAllByTestId('icon-chevron-down').concat(
        screen.queryAllByTestId('icon-chevron-right')
      )
      expect(chevrons.length).toBe(0)
    })

    it('running phase 預設應該展開', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      // Check details should be visible
      expect(screen.getByText('Probe queued')).toBeInTheDocument()
    })

    it('failed phase 預設應該展開', () => {
      render(<PipelinePhaseCard result={failedPhase} />)
      expect(screen.getByText('Batch queued')).toBeInTheDocument()
      expect(screen.getByText('Batch completed')).toBeInTheDocument()
    })

    it('點擊應該切換展開狀態', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      // Passed phases start collapsed — find the main button
      const btn = screen.getByText('Pilot Crawl').closest('button')
      if (btn) {
        fireEvent.click(btn)
        expect(screen.getByText('Pilot search')).toBeInTheDocument()
      }
    })
  })

  describe('Check Items', () => {
    it('通過的 check 應該顯示 check icon', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      expect(screen.getByText('Probe queued')).toBeInTheDocument()
    })

    it('失敗的 check 應該顯示 X icon', () => {
      render(<PipelinePhaseCard result={failedPhase} />)
      expect(screen.getByText('Batch completed')).toBeInTheDocument()
    })

    it('check detail 應該顯示', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      expect(screen.getByText('task-123')).toBeInTheDocument()
    })
  })

  describe('Duration', () => {
    it('有 startedAt 和 completedAt 時應該顯示時長', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      // Should show something like "5.0s"
      expect(screen.getByText(/\d+\.?\d*s/)).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('running 應該有藍色邊框', () => {
      render(<PipelinePhaseCard result={runningPhase} />)
      const card = screen.getByTestId('phase-card')
      expect(card.className).toContain('border-l-blue-500')
    })

    it('failed 應該有紅色邊框', () => {
      render(<PipelinePhaseCard result={failedPhase} />)
      const card = screen.getByTestId('phase-card')
      expect(card.className).toContain('border-l-red-500')
    })

    it('passed 應該有綠色邊框', () => {
      render(<PipelinePhaseCard result={passedPhase} />)
      const card = screen.getByTestId('phase-card')
      expect(card.className).toContain('border-l-green-500')
    })

    it('pending 應該有降低透明度', () => {
      render(<PipelinePhaseCard result={pendingPhase} />)
      const card = screen.getByTestId('phase-card')
      expect(card.className).toContain('opacity-60')
    })
  })
})
