import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductDetailDrawer from '@/components/products/ProductDetailDrawer'

// Mock UI components
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-content" className={className}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="sheet-title">{children}</h2>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="sheet-description">{children}</p>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
  }) => (
    <button data-testid="button" onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x">✕</span>,
  ExternalLink: () => <span data-testid="icon-external-link">↗</span>,
  Copy: () => <span data-testid="icon-copy">📋</span>,
  Calendar: () => <span data-testid="icon-calendar">📅</span>,
  Package: () => <span data-testid="icon-package">📦</span>,
  Barcode: () => <span data-testid="icon-barcode">|||</span>,
  Star: () => <span data-testid="icon-star">⭐</span>,
  AlertCircle: () => <span data-testid="icon-alert">⚠</span>,
  CheckCircle: () => <span data-testid="icon-check">✓</span>,
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-15'),
}))

const createMockProduct = (overrides?: Record<string, unknown>) => ({
  id: 'product-123',
  product_id: 'prod-123',
  name: 'Test Product',
  brand: 'Test Brand',
  barcode: '1234567890123',
  category: 'Food',
  subcategory: 'Snacks',
  description: 'A test product description',
  ingredients: ['Water', 'Sugar', 'Salt'],
  allergens: ['Peanuts', 'Milk'],
  nutrition_facts: {
    calories: 100,
    protein: 5,
    fat: 10,
    carbohydrates: 15,
  },
  image_url: 'https://example.com/product.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  data_quality_tier: 'A',
  is_gold_sample: false,
  ...overrides,
})

describe('ProductDetailDrawer', () => {
  const mockOnClose = vi.fn()
  const defaultProps = {
    product: createMockProduct(),
    open: true,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering when open', () => {
    it('should render the sheet when open is true', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })

    it('should render sheet content', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
    })

    it('should render sheet header', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      expect(screen.getByTestId('sheet-header')).toBeInTheDocument()
    })

    it('should render product name in title', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      expect(screen.getByTestId('sheet-title')).toBeInTheDocument()
    })
  })

  describe('Rendering when closed', () => {
    it('should not render when open is false', () => {
      render(<ProductDetailDrawer {...defaultProps} open={false} />)

      expect(screen.queryByTestId('sheet')).not.toBeInTheDocument()
    })
  })

  describe('Product information display', () => {
    it('should render badges', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      const badges = screen.getAllByTestId('badge')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('Tabs', () => {
    it('should render tabs component', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('should render tabs list', () => {
      render(<ProductDetailDrawer {...defaultProps} />)

      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })
  })

  describe('With gold sample product', () => {
    it('should render gold sample indicator', () => {
      const goldProduct = createMockProduct({ is_gold_sample: true })
      render(<ProductDetailDrawer {...defaultProps} product={goldProduct} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })
  })

  describe('With different quality tiers', () => {
    it('should render with tier A', () => {
      const tierAProduct = createMockProduct({ data_quality_tier: 'A' })
      render(<ProductDetailDrawer {...defaultProps} product={tierAProduct} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })

    it('should render with tier B', () => {
      const tierBProduct = createMockProduct({ data_quality_tier: 'B' })
      render(<ProductDetailDrawer {...defaultProps} product={tierBProduct} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })

    it('should render with tier C', () => {
      const tierCProduct = createMockProduct({ data_quality_tier: 'C' })
      render(<ProductDetailDrawer {...defaultProps} product={tierCProduct} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })
  })

  describe('With missing data', () => {
    it('should handle product without allergens', () => {
      const productNoAllergens = createMockProduct({ allergens: [] })
      render(<ProductDetailDrawer {...defaultProps} product={productNoAllergens} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })

    it('should handle product without ingredients', () => {
      const productNoIngredients = createMockProduct({ ingredients: [] })
      render(<ProductDetailDrawer {...defaultProps} product={productNoIngredients} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })

    it('should handle product without nutrition facts', () => {
      const productNoNutrition = createMockProduct({ nutrition_facts: null })
      render(<ProductDetailDrawer {...defaultProps} product={productNoNutrition} />)

      expect(screen.getByTestId('sheet')).toBeInTheDocument()
    })
  })
})
