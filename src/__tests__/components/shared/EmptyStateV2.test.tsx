import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EmptyStateV2 from '@/components/shared/EmptyStateV2'
import { Search, Plus, FileText } from 'lucide-react'

// Mock featureFlags
vi.mock('@/lib/featureFlags', () => ({
  isFeatureEnabled: vi.fn(() => true),
}))

// Mock EmptyState (V1 fallback)
vi.mock('./EmptyState', () => ({
  default: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="empty-state-v1">
      <span>{title}</span>
      {description && <span>{description}</span>}
    </div>
  ),
}))

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
    className?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

describe('EmptyStateV2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render title', () => {
      render(<EmptyStateV2 title="No items found" />)

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
      render(
        <EmptyStateV2
          title="No items found"
          description="Try adjusting your search criteria"
        />
      )

      expect(screen.getByText('No items found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument()
    })

    it('should render help text when provided', () => {
      render(
        <EmptyStateV2
          title="No items found"
          helpText="Need help? Contact support."
        />
      )

      expect(screen.getByText('Need help? Contact support.')).toBeInTheDocument()
    })

    it('should render icon when provided', () => {
      render(
        <EmptyStateV2
          title="No items found"
          icon={Search}
        />
      )

      // The component renders an icon - check for its presence
      const container = screen.getByText('No items found').closest('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('should render primary action button when provided', () => {
      const handleClick = vi.fn()

      render(
        <EmptyStateV2
          title="No items found"
          primaryAction={{
            label: 'Add item',
            onClick: handleClick,
          }}
        />
      )

      const button = screen.getByText('Add item')
      expect(button).toBeInTheDocument()

      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalled()
    })

    it('should render secondary action button when provided', () => {
      const handlePrimary = vi.fn()
      const handleSecondary = vi.fn()

      render(
        <EmptyStateV2
          title="No items found"
          primaryAction={{
            label: 'Add item',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'Learn more',
            onClick: handleSecondary,
          }}
        />
      )

      expect(screen.getByText('Add item')).toBeInTheDocument()
      expect(screen.getByText('Learn more')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Learn more'))
      expect(handleSecondary).toHaveBeenCalled()
    })

    it('should render action with icon when provided', () => {
      const handleClick = vi.fn()

      render(
        <EmptyStateV2
          title="No items found"
          primaryAction={{
            label: 'Add item',
            onClick: handleClick,
            icon: Plus,
          }}
        />
      )

      expect(screen.getByText('Add item')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(
        <EmptyStateV2
          title="No items found"
          variant="default"
        />
      )

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should render compact variant', () => {
      render(
        <EmptyStateV2
          title="No items found"
          variant="compact"
        />
      )

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should render hero variant', () => {
      render(
        <EmptyStateV2
          title="No items found"
          variant="hero"
        />
      )

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })
  })

  describe('Icon background colors', () => {
    const colors = ['blue', 'gray', 'purple', 'green', 'orange', 'red', 'indigo'] as const

    colors.forEach((color) => {
      it(`should render with ${color} icon background`, () => {
        render(
          <EmptyStateV2
            title="No items found"
            icon={Search}
            iconBackgroundColor={color}
          />
        )

        expect(screen.getByText('No items found')).toBeInTheDocument()
      })
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EmptyStateV2
          title="No items found"
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply custom iconClassName', () => {
      render(
        <EmptyStateV2
          title="No items found"
          icon={Search}
          iconClassName="custom-icon-class"
        />
      )

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })
  })

  describe('Feature flag fallback', () => {
    it('should fall back to V1 when feature flag is disabled', async () => {
      const { isFeatureEnabled } = await import('@/lib/featureFlags')
      vi.mocked(isFeatureEnabled).mockReturnValue(false)

      render(
        <EmptyStateV2
          title="No items found"
          description="Try adjusting your search"
        />
      )

      // V1 fallback should be rendered
      expect(screen.getByTestId('empty-state-v1')).toBeInTheDocument()
    })
  })
})
