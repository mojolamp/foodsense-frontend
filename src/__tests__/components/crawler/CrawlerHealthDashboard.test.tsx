/**
 * CrawlerHealthDashboard Component Tests
 * 2x2 data quality metric cards
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'

// Mutable hook return values for test overrides
let mockIngestionReturn: { data: unknown; isLoading: boolean } = {
  data: {
    total_records: 1234,
    by_status: { valid: 1100, invalid: 134 },
    by_source_type: { crawler: 1000, manual: 234 },
    today_count: 56,
    pass_rate: 0.891,
    queried_at: '2026-02-19T00:00:00Z',
    source: 'live',
  },
  isLoading: false,
}

// Mock data quality hooks
vi.mock('@/hooks/useDataQualityV2', () => ({
  useDQIngestionSummary: () => mockIngestionReturn,
  useDQCoverage: () => ({
    data: {
      total_products: 500,
      fields: {
        product_name: 0.98,
        ingredients: 0.85,
        nutrition_facts: 0.72,
        brand: 0.45,
        allergens: 0.30,
      },
      queried_at: '2026-02-19T00:00:00Z',
    },
    isLoading: false,
  }),
  useDQFreshness: () => ({
    data: {
      total_products: 500,
      age_distribution: { '0-7d': 120, '7-30d': 250, '30-90d': 100, '90d+': 30 },
      avg_age_days: 22.5,
      stale_count: 30,
      queried_at: '2026-02-19T00:00:00Z',
    },
    isLoading: false,
  }),
  useDQValidationErrors: () => ({
    data: {
      total_errors: 45,
      by_type: { missing_field: 20, format_error: 15, range_violation: 10 },
      by_field: { ingredients: 18, nutrition_facts: 12, brand: 8, allergens: 7 },
      recent_errors: [],
      queried_at: '2026-02-19T00:00:00Z',
    },
    isLoading: false,
  }),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Database: () => <span data-testid="icon-database">🗄</span>,
  BarChart3: () => <span data-testid="icon-chart">📊</span>,
  Clock: () => <span data-testid="icon-clock">⏱</span>,
  AlertTriangle: () => <span data-testid="icon-alert">⚠</span>,
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
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

import CrawlerHealthDashboard from '@/components/crawler/CrawlerHealthDashboard'

describe('CrawlerHealthDashboard', () => {
  describe('Ingestion Summary Card', () => {
    it('應該顯示 Ingestion Summary 標題', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('Ingestion Summary')).toBeInTheDocument()
    })

    it('應該顯示 total records', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('應該顯示 today count', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('56')).toBeInTheDocument()
    })

    it('應該顯示 pass rate badge', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('89.1% pass')).toBeInTheDocument()
    })

    it('應該顯示 by_status 分佈', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('valid: 1100')).toBeInTheDocument()
      expect(screen.getByText('invalid: 134')).toBeInTheDocument()
    })
  })

  describe('Coverage Card', () => {
    it('應該顯示 Field Coverage 標題', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('Field Coverage')).toBeInTheDocument()
    })

    it('應該顯示 total products', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('500 products')).toBeInTheDocument()
    })

    it('應該顯示各 field 的覆蓋百分比', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('98%')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('72%')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()
      expect(screen.getByText('30%')).toBeInTheDocument()
    })

    it('應該顯示 field 名稱', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('product_name')).toBeInTheDocument()
      expect(screen.getByText('ingredients')).toBeInTheDocument()
    })
  })

  describe('Freshness Card', () => {
    it('應該顯示 Freshness 標題', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('Freshness')).toBeInTheDocument()
    })

    it('應該顯示平均天數', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('22.5')).toBeInTheDocument()
    })

    it('應該顯示 stale count badge', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('30 stale')).toBeInTheDocument()
    })

    it('應該顯示 age distribution buckets', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('0-7d: 120')).toBeInTheDocument()
      expect(screen.getByText('7-30d: 250')).toBeInTheDocument()
    })
  })

  describe('Validation Errors Card', () => {
    it('應該顯示 Validation Errors 標題', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('Validation Errors')).toBeInTheDocument()
    })

    it('應該顯示 total errors', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('45')).toBeInTheDocument()
    })

    it('應該顯示 by_type 分佈', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('missing_field')).toBeInTheDocument()
      expect(screen.getByText('format_error')).toBeInTheDocument()
    })

    it('應該顯示 by_field badges', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByText('ingredients: 18')).toBeInTheDocument()
      expect(screen.getByText('nutrition_facts: 12')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('應該渲染 4 個 cards', () => {
      render(<CrawlerHealthDashboard />)
      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBe(4)
    })

    it('應該顯示 4 個 section icons', () => {
      render(<CrawlerHealthDashboard />)
      expect(screen.getByTestId('icon-database')).toBeInTheDocument()
      expect(screen.getByTestId('icon-chart')).toBeInTheDocument()
      expect(screen.getByTestId('icon-clock')).toBeInTheDocument()
      expect(screen.getByTestId('icon-alert')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('loading 時應該顯示 skeleton', () => {
      // Override mutable mock to loading state
      mockIngestionReturn = { data: undefined, isLoading: true }

      render(<CrawlerHealthDashboard />)
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)

      // Restore
      mockIngestionReturn = {
        data: {
          total_records: 1234,
          by_status: { valid: 1100, invalid: 134 },
          by_source_type: { crawler: 1000, manual: 234 },
          today_count: 56,
          pass_rate: 0.891,
          queried_at: '2026-02-19T00:00:00Z',
          source: 'live',
        },
        isLoading: false,
      }
    })
  })
})
