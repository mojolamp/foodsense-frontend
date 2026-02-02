import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReviewQueueTable from '@/components/review/ReviewQueueTable'
import type { OCRRecord, PrioritySortStrategy } from '@/types/review'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 小時前'),
}))

vi.mock('date-fns/locale', () => ({
  zhTW: {},
}))

// Mock UI components
vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td className={className}>{children}</td>
  ),
  TableHead: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th className={className}>{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableRow: ({
    children,
    className,
    onClick,
    'data-testid': testId,
    'aria-selected': ariaSelected,
  }: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    'data-testid'?: string
    'aria-selected'?: boolean
  }) => (
    <tr
      data-testid={testId}
      className={className}
      onClick={onClick}
      aria-selected={ariaSelected}
    >
      {children}
    </tr>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode
    variant?: string
    className?: string
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    size,
    variant,
    className,
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
    size?: string
    variant?: string
    className?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/lib/priorityCalculator', () => ({
  getPriorityColor: vi.fn((score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }),
  getPriorityLabel: vi.fn((score: number) => {
    if (score >= 80) return '高優先'
    if (score >= 50) return '中優先'
    return '低優先'
  }),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="icon-arrow-right">→</span>,
  Clock: () => <span data-testid="icon-clock">🕐</span>,
  CheckSquare: () => <span data-testid="icon-check-square">☑</span>,
  Square: () => <span data-testid="icon-square">☐</span>,
  ArrowUpDown: () => <span data-testid="icon-arrow-up-down">↕</span>,
}))

const createMockRecord = (id: string, overrides?: Partial<OCRRecord>): OCRRecord => ({
  id,
  product_id: `product-${id}`,
  logic_validation_status: 'WARN',
  confidence_level: 'MEDIUM',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ocr_text: 'Sample OCR text',
  image_url: 'https://example.com/image.jpg',
  ...overrides,
})

describe('ReviewQueueTable', () => {
  const mockOnReview = vi.fn()
  const mockOnBatchReview = vi.fn()
  const mockOnActiveIdChange = vi.fn()
  const mockOnSelectedIdsChange = vi.fn()
  const mockOnSortStrategyChange = vi.fn()

  const defaultProps = {
    data: [createMockRecord('1'), createMockRecord('2'), createMockRecord('3')],
    onReview: mockOnReview,
    activeId: null,
    onActiveIdChange: mockOnActiveIdChange,
    selectedIds: new Set<string>(),
    onSelectedIdsChange: mockOnSelectedIdsChange,
    sortStrategy: null as PrioritySortStrategy | null,
    onSortStrategyChange: mockOnSortStrategyChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty state', () => {
    it('should render empty state when data is empty', () => {
      render(<ReviewQueueTable {...defaultProps} data={[]} />)

      expect(screen.getByText('目前沒有待審核記錄')).toBeInTheDocument()
      expect(screen.getByTestId('icon-clock')).toBeInTheDocument()
    })

    it('should not render table when data is empty', () => {
      render(<ReviewQueueTable {...defaultProps} data={[]} />)

      expect(screen.queryByTestId('table')).not.toBeInTheDocument()
    })
  })

  describe('Table rendering', () => {
    it('should render table with data', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      expect(screen.getByTestId('table')).toBeInTheDocument()
      expect(screen.getByTestId('table-header')).toBeInTheDocument()
      expect(screen.getByTestId('table-body')).toBeInTheDocument()
    })

    it('should render correct number of rows', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      expect(screen.getByTestId('review-queue-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('review-queue-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('review-queue-row-2')).toBeInTheDocument()
    })

    it('should render record IDs truncated', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      // Record ID is displayed as first 8 characters + ...
      expect(screen.getByText('1...')).toBeInTheDocument()
    })

    it('should render product IDs', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      expect(screen.getByText('product-1')).toBeInTheDocument()
      expect(screen.getByText('product-2')).toBeInTheDocument()
    })

    it('should render validation status badges', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      const badges = screen.getAllByTestId('badge')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('Sort strategy', () => {
    it('should render sort strategy selector', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      expect(screen.getByText('優先級排序:')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should call onSortStrategyChange when selection changes', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'urgent_first' } })

      expect(mockOnSortStrategyChange).toHaveBeenCalledWith('urgent_first')
    })

    it('should show "已啟用智能排序" badge when sort strategy is active', () => {
      render(<ReviewQueueTable {...defaultProps} sortStrategy="balanced" />)

      expect(screen.getByText('已啟用智能排序')).toBeInTheDocument()
    })

    it('should render priority column when sort strategy is active', () => {
      const dataWithPriority = defaultProps.data.map((r) => ({
        ...r,
        priority_score: 75,
      }))

      render(
        <ReviewQueueTable
          {...defaultProps}
          data={dataWithPriority}
          sortStrategy="balanced"
        />
      )

      expect(screen.getByText('優先級')).toBeInTheDocument()
    })
  })

  describe('Row interaction', () => {
    it('should call onActiveIdChange when row is clicked', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      const row = screen.getByTestId('review-queue-row-0')
      fireEvent.click(row)

      expect(mockOnActiveIdChange).toHaveBeenCalledWith('1')
    })

    it('should highlight active row', () => {
      render(<ReviewQueueTable {...defaultProps} activeId="1" />)

      const row = screen.getByTestId('review-queue-row-0')
      expect(row).toHaveAttribute('aria-selected', 'true')
    })

    it('should call onReview when review button is clicked', () => {
      render(<ReviewQueueTable {...defaultProps} />)

      const buttons = screen.getAllByTestId('button')
      const reviewButton = buttons.find((btn) => btn.textContent?.includes('審核'))
      fireEvent.click(reviewButton!)

      expect(mockOnReview).toHaveBeenCalled()
    })
  })

  describe('Batch selection', () => {
    it('should show selection checkboxes when onBatchReview is provided', () => {
      render(<ReviewQueueTable {...defaultProps} onBatchReview={mockOnBatchReview} />)

      expect(screen.getAllByTestId('icon-square').length).toBeGreaterThan(0)
    })

    it('should not show selection checkboxes when onBatchReview is not provided', () => {
      render(<ReviewQueueTable {...defaultProps} onBatchReview={undefined} />)

      // Should not have select all button in header
      expect(screen.queryByLabelText('全選')).not.toBeInTheDocument()
    })

    it('should show batch action bar when items are selected', () => {
      const selectedIds = new Set(['1', '2'])

      render(
        <ReviewQueueTable
          {...defaultProps}
          onBatchReview={mockOnBatchReview}
          selectedIds={selectedIds}
        />
      )

      expect(screen.getByText('已選擇 2 筆記錄')).toBeInTheDocument()
      expect(screen.getByText('取消選擇')).toBeInTheDocument()
      expect(screen.getByText('批次審核')).toBeInTheDocument()
    })

    it('should call onSelectedIdsChange when cancel selection is clicked', () => {
      const selectedIds = new Set(['1', '2'])

      render(
        <ReviewQueueTable
          {...defaultProps}
          onBatchReview={mockOnBatchReview}
          selectedIds={selectedIds}
        />
      )

      const cancelButton = screen.getByText('取消選擇')
      fireEvent.click(cancelButton)

      expect(mockOnSelectedIdsChange).toHaveBeenCalledWith(new Set())
    })

    it('should call onBatchReview when batch review button is clicked', () => {
      const selectedIds = new Set(['1', '2'])

      render(
        <ReviewQueueTable
          {...defaultProps}
          onBatchReview={mockOnBatchReview}
          selectedIds={selectedIds}
        />
      )

      const batchButton = screen.getByText('批次審核')
      fireEvent.click(batchButton)

      expect(mockOnBatchReview).toHaveBeenCalled()
    })
  })

  describe('Select all functionality', () => {
    it('should toggle select all when header checkbox is clicked', () => {
      render(<ReviewQueueTable {...defaultProps} onBatchReview={mockOnBatchReview} />)

      const selectAllButton = screen.getByLabelText('全選')
      fireEvent.click(selectAllButton)

      expect(mockOnSelectedIdsChange).toHaveBeenCalled()
    })

    it('should show check icon when all items are selected', () => {
      const allIds = new Set(['1', '2', '3'])

      render(
        <ReviewQueueTable
          {...defaultProps}
          onBatchReview={mockOnBatchReview}
          selectedIds={allIds}
        />
      )

      const deselectAllButton = screen.getByLabelText('取消全選')
      expect(deselectAllButton).toBeInTheDocument()
    })
  })

  describe('Individual row selection', () => {
    it('should toggle individual selection when checkbox is clicked', () => {
      render(<ReviewQueueTable {...defaultProps} onBatchReview={mockOnBatchReview} />)

      const checkboxes = screen.getAllByLabelText('選擇')
      fireEvent.click(checkboxes[0])

      expect(mockOnSelectedIdsChange).toHaveBeenCalled()
      expect(mockOnActiveIdChange).toHaveBeenCalledWith('1')
    })

    it('should show check icon for selected rows', () => {
      const selectedIds = new Set(['1'])

      render(
        <ReviewQueueTable
          {...defaultProps}
          onBatchReview={mockOnBatchReview}
          selectedIds={selectedIds}
        />
      )

      const deselectButton = screen.getByLabelText('取消選擇')
      expect(deselectButton).toBeInTheDocument()
    })
  })
})
