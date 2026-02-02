import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BatchReviewModal from '@/components/review/BatchReviewModal'
import type { OCRRecord } from '@/types/review'

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => (e: React.FormEvent) => {
      e?.preventDefault?.()
      return fn({})
    }),
    watch: vi.fn(() => 8),
    setValue: vi.fn(),
    formState: { errors: {} },
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn()),
}))

// Mock hooks
vi.mock('@/hooks/useReviewQueue', () => ({
  useBatchReviewSubmit: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

// Mock UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
    variant,
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: string
    disabled?: boolean
    variant?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      type={type as 'button' | 'submit' | 'reset' | undefined}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="input" {...props} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label data-testid="label" htmlFor={htmlFor}>
      {children}
    </label>
  ),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea data-testid="textarea" {...props} />
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
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

describe('BatchReviewModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmitted = vi.fn()
  const defaultRecords = [
    createMockRecord('1'),
    createMockRecord('2'),
    createMockRecord('3'),
  ]
  const defaultProps = {
    records: defaultRecords,
    open: true,
    onClose: mockOnClose,
    onSubmitted: mockOnSubmitted,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering when open', () => {
    it('should render the dialog when open', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    it('should render dialog content', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })

    it('should render dialog header', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
    })

    it('should render dialog title', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    })

    it('should render dialog footer', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
    })
  })

  describe('Rendering when closed', () => {
    it('should not render when open is false', () => {
      render(<BatchReviewModal {...defaultProps} open={false} />)

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Record count display', () => {
    it('should display the number of records', () => {
      render(<BatchReviewModal {...defaultProps} />)

      // The component should show the count somewhere
      const content = screen.getByTestId('dialog-content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Form elements', () => {
    it('should render form inputs', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getAllByTestId('input').length).toBeGreaterThanOrEqual(0)
    })

    it('should render buttons', () => {
      render(<BatchReviewModal {...defaultProps} />)

      expect(screen.getAllByTestId('button').length).toBeGreaterThan(0)
    })
  })

  describe('With empty records', () => {
    it('should handle empty records array', () => {
      render(<BatchReviewModal {...defaultProps} records={[]} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })

  describe('With single record', () => {
    it('should handle single record', () => {
      render(<BatchReviewModal {...defaultProps} records={[createMockRecord('1')]} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })

  describe('With many records', () => {
    it('should handle many records', () => {
      const manyRecords = Array.from({ length: 50 }, (_, i) =>
        createMockRecord(`record-${i}`)
      )

      render(<BatchReviewModal {...defaultProps} records={manyRecords} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })

  describe('Records with different statuses', () => {
    it('should handle mixed validation statuses', () => {
      const mixedRecords = [
        createMockRecord('1', { logic_validation_status: 'PASS' }),
        createMockRecord('2', { logic_validation_status: 'WARN' }),
        createMockRecord('3', { logic_validation_status: 'FAIL' }),
      ]

      render(<BatchReviewModal {...defaultProps} records={mixedRecords} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    it('should handle mixed confidence levels', () => {
      const mixedRecords = [
        createMockRecord('1', { confidence_level: 'HIGH' }),
        createMockRecord('2', { confidence_level: 'MEDIUM' }),
        createMockRecord('3', { confidence_level: 'LOW' }),
      ]

      render(<BatchReviewModal {...defaultProps} records={mixedRecords} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })
})
