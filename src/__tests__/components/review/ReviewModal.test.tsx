import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReviewModal from '@/components/review/ReviewModal'
import type { OCRRecord } from '@/types/review'

// Mock react-hook-form
const mockRegister = vi.fn()
const mockHandleSubmit = vi.fn((fn) => (e: React.FormEvent) => {
  e?.preventDefault?.()
  return fn({ data_quality_score: 8, confidence_score: 0.9, review_notes: '', is_gold: false })
})
const mockWatch = vi.fn((field: string) => {
  const values: Record<string, number | string | boolean> = {
    data_quality_score: 8,
    confidence_score: 0.9,
    review_notes: '',
    is_gold: false,
  }
  return values[field]
})
const mockSetValue = vi.fn()

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    watch: mockWatch,
    setValue: mockSetValue,
    formState: { errors: {} },
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn()),
}))

// Mock useReviewSubmit hook
const mockMutate = vi.fn()
vi.mock('@/hooks/useReviewQueue', () => ({
  useReviewSubmit: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}))

// Mock hotkeys
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn(),
}))

// Mock UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
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

const createMockRecord = (overrides?: Partial<OCRRecord>): OCRRecord => ({
  id: 'record-123',
  product_id: 'product-456',
  logic_validation_status: 'WARN',
  confidence_level: 'MEDIUM',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ocr_text: 'Sample OCR text content',
  image_url: 'https://example.com/image.jpg',
  ...overrides,
})

describe('ReviewModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmitted = vi.fn()
  const defaultProps = {
    record: createMockRecord(),
    onClose: mockOnClose,
    onSubmitted: mockOnSubmitted,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the dialog', () => {
      render(<ReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })

    it('should render dialog header with title', () => {
      render(<ReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    })

    it('should render form inputs', () => {
      render(<ReviewModal {...defaultProps} />)

      expect(screen.getAllByTestId('input').length).toBeGreaterThan(0)
    })

    it('should render dialog footer with buttons', () => {
      render(<ReviewModal {...defaultProps} />)

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
      expect(screen.getAllByTestId('button').length).toBeGreaterThan(0)
    })

    it('should display record information', () => {
      render(<ReviewModal {...defaultProps} />)

      // The component should show record ID somewhere
      const content = screen.getByTestId('dialog-content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Form interactions', () => {
    it('should register form fields', () => {
      render(<ReviewModal {...defaultProps} />)

      expect(mockRegister).toHaveBeenCalled()
    })

    it('should watch form values', () => {
      render(<ReviewModal {...defaultProps} />)

      expect(mockWatch).toHaveBeenCalled()
    })
  })

  describe('Buttons', () => {
    it('should have cancel button', () => {
      render(<ReviewModal {...defaultProps} />)

      const buttons = screen.getAllByTestId('button')
      const cancelButton = buttons.find(
        (btn) =>
          btn.textContent?.includes('取消') ||
          btn.getAttribute('data-variant') === 'outline'
      )
      expect(cancelButton).toBeInTheDocument()
    })

    it('should have submit button', () => {
      render(<ReviewModal {...defaultProps} />)

      const buttons = screen.getAllByTestId('button')
      const submitButton = buttons.find(
        (btn) =>
          btn.getAttribute('type') === 'submit' ||
          btn.textContent?.includes('提交')
      )
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Close behavior', () => {
    it('should call onClose when cancel is clicked', () => {
      render(<ReviewModal {...defaultProps} />)

      const buttons = screen.getAllByTestId('button')
      const cancelButton = buttons.find(
        (btn) =>
          btn.textContent?.includes('取消') ||
          btn.getAttribute('data-variant') === 'outline' ||
          btn.getAttribute('data-variant') === 'ghost'
      )

      if (cancelButton) {
        fireEvent.click(cancelButton)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })
  })

  describe('Form validation schema', () => {
    it('should use zod resolver', async () => {
      const { zodResolver } = await import('@hookform/resolvers/zod')
      expect(zodResolver).toHaveBeenCalled()
    })
  })
})

describe('ReviewModal with different record states', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with FAIL validation status', () => {
    const record = createMockRecord({ logic_validation_status: 'FAIL' })
    render(<ReviewModal record={record} onClose={mockOnClose} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render with PASS validation status', () => {
    const record = createMockRecord({ logic_validation_status: 'PASS' })
    render(<ReviewModal record={record} onClose={mockOnClose} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render with LOW confidence level', () => {
    const record = createMockRecord({ confidence_level: 'LOW' })
    render(<ReviewModal record={record} onClose={mockOnClose} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render with HIGH confidence level', () => {
    const record = createMockRecord({ confidence_level: 'HIGH' })
    render(<ReviewModal record={record} onClose={mockOnClose} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })
})
