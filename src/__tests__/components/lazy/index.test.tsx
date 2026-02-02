import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  LazyReviewModal,
  LazyBatchReviewModal,
  LazyProductDetailDrawer,
  LazyCommandPalette,
  LazyEfficiencyAnalysis,
  LazyTimeRangePicker,
  LazyReviewQueueTable,
  LazyReviewQueueList,
  LazyEvidencePreview,
  LazyPresenceBatchCheck,
  preloadCommonModals,
  preloadAnalytics,
  preloadReviewComponents,
} from '@/components/lazy'

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: vi.fn((importFunc, options) => {
    const MockComponent = (props: Record<string, unknown>) => {
      return <div data-testid="dynamic-component" {...props}>Dynamic Component</div>
    }
    MockComponent.displayName = 'DynamicComponent'
    return MockComponent
  }),
}))

// Mock dynamic-imports utilities
vi.mock('@/lib/dynamic-imports', () => ({
  lazyModal: vi.fn((importFunc) => {
    const MockComponent = (props: Record<string, unknown>) => (
      <div data-testid="lazy-modal" {...props}>Lazy Modal</div>
    )
    MockComponent.preload = importFunc
    return MockComponent
  }),
  lazyChart: vi.fn((importFunc) => {
    const MockComponent = (props: Record<string, unknown>) => (
      <div data-testid="lazy-chart" {...props}>Lazy Chart</div>
    )
    MockComponent.preload = importFunc
    return MockComponent
  }),
  lazyWithPreload: vi.fn((importFunc, options) => {
    const MockComponent = (props: Record<string, unknown>) => (
      <div data-testid="lazy-preload" {...props}>Lazy Preload</div>
    )
    MockComponent.preload = importFunc
    return MockComponent
  }),
}))

// Mock LoadingFallback components
vi.mock('@/components/ui/LoadingFallback', () => ({
  ModalSkeleton: () => <div data-testid="modal-skeleton">Modal Skeleton</div>,
  ChartSkeleton: () => <div data-testid="chart-skeleton">Chart Skeleton</div>,
  DrawerSkeleton: () => <div data-testid="drawer-skeleton">Drawer Skeleton</div>,
  TableSkeleton: ({ rows }: { rows: number }) => (
    <div data-testid="table-skeleton">Table Skeleton ({rows} rows)</div>
  ),
}))

describe('Lazy Components Export', () => {
  describe('Modal Components', () => {
    it('should export LazyReviewModal', () => {
      expect(LazyReviewModal).toBeDefined()
    })

    it('should export LazyBatchReviewModal', () => {
      expect(LazyBatchReviewModal).toBeDefined()
    })

    it('should export LazyProductDetailDrawer', () => {
      expect(LazyProductDetailDrawer).toBeDefined()
    })

    it('should export LazyCommandPalette', () => {
      expect(LazyCommandPalette).toBeDefined()
    })
  })

  describe('Chart/Analytics Components', () => {
    it('should export LazyEfficiencyAnalysis', () => {
      expect(LazyEfficiencyAnalysis).toBeDefined()
    })

    it('should export LazyTimeRangePicker', () => {
      expect(LazyTimeRangePicker).toBeDefined()
    })
  })

  describe('Table Components', () => {
    it('should export LazyReviewQueueTable', () => {
      expect(LazyReviewQueueTable).toBeDefined()
    })

    it('should export LazyReviewQueueList', () => {
      expect(LazyReviewQueueList).toBeDefined()
    })
  })

  describe('Feature Components', () => {
    it('should export LazyEvidencePreview', () => {
      expect(LazyEvidencePreview).toBeDefined()
    })

    it('should export LazyPresenceBatchCheck', () => {
      expect(LazyPresenceBatchCheck).toBeDefined()
    })
  })
})

describe('Preload Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('preloadCommonModals', () => {
    it('should be a function', () => {
      expect(typeof preloadCommonModals).toBe('function')
    })

    it('should call preload on LazyReviewModal and LazyCommandPalette', () => {
      // Mock preload methods
      const reviewModalPreload = vi.fn()
      const commandPalettePreload = vi.fn()

      // Store original values
      const originalReviewModal = LazyReviewModal
      const originalCommandPalette = LazyCommandPalette

      // Mock the preload methods
      ;(LazyReviewModal as { preload?: () => void }).preload = reviewModalPreload
      ;(LazyCommandPalette as { preload?: () => void }).preload = commandPalettePreload

      preloadCommonModals()

      expect(reviewModalPreload).toHaveBeenCalled()
      expect(commandPalettePreload).toHaveBeenCalled()
    })
  })

  describe('preloadAnalytics', () => {
    it('should be a function', () => {
      expect(typeof preloadAnalytics).toBe('function')
    })

    it('should call preload on LazyEfficiencyAnalysis', () => {
      const efficiencyPreload = vi.fn()
      ;(LazyEfficiencyAnalysis as { preload?: () => void }).preload = efficiencyPreload

      preloadAnalytics()

      expect(efficiencyPreload).toHaveBeenCalled()
    })
  })

  describe('preloadReviewComponents', () => {
    it('should be a function', () => {
      expect(typeof preloadReviewComponents).toBe('function')
    })

    it('should call preload on review-related components', () => {
      const reviewModalPreload = vi.fn()
      const batchReviewModalPreload = vi.fn()

      ;(LazyReviewModal as { preload?: () => void }).preload = reviewModalPreload
      ;(LazyBatchReviewModal as { preload?: () => void }).preload = batchReviewModalPreload

      preloadReviewComponents()

      expect(reviewModalPreload).toHaveBeenCalled()
      expect(batchReviewModalPreload).toHaveBeenCalled()
    })
  })
})

describe('Lazy Component Rendering', () => {
  it('should render LazyReviewModal', () => {
    render(<LazyReviewModal />)
    expect(screen.getByTestId('lazy-preload')).toBeInTheDocument()
  })

  it('should render LazyBatchReviewModal', () => {
    render(<LazyBatchReviewModal />)
    expect(screen.getByTestId('lazy-preload')).toBeInTheDocument()
  })

  it('should render LazyCommandPalette', () => {
    render(<LazyCommandPalette />)
    expect(screen.getByTestId('lazy-preload')).toBeInTheDocument()
  })

  it('should render LazyEfficiencyAnalysis', () => {
    render(<LazyEfficiencyAnalysis />)
    expect(screen.getByTestId('lazy-preload')).toBeInTheDocument()
  })

  it('should render LazyProductDetailDrawer', () => {
    render(<LazyProductDetailDrawer />)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })

  it('should render LazyTimeRangePicker', () => {
    render(<LazyTimeRangePicker />)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })

  it('should render LazyReviewQueueTable', () => {
    render(<LazyReviewQueueTable />)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })

  it('should render LazyReviewQueueList', () => {
    render(<LazyReviewQueueList />)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })

  it('should render LazyEvidencePreview', () => {
    render(<LazyEvidencePreview />)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })

  it('should render LazyPresenceBatchCheck', () => {
    render(<LazyPresenceBatchCheck />)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })
})
