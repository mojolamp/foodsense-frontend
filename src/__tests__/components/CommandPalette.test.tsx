import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommandPalette from '@/components/CommandPalette'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock useCommandSearch hook
vi.mock('@/hooks/useCommandSearch', () => ({
  useCommandSearch: vi.fn(() => ({
    results: [],
    isSearching: false,
  })),
  useSearchHistory: vi.fn(() => ({
    history: [],
    addToHistory: vi.fn(),
    clearHistory: vi.fn(),
  })),
}))

// Mock Dialog component
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
}))

// Mock cmdk
vi.mock('cmdk', () => ({
  Command: Object.assign(
    ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="command" className={className}>
        {children}
      </div>
    ),
    {
      Input: ({
        placeholder,
        value,
        onValueChange,
        className,
      }: {
        placeholder?: string
        value?: string
        onValueChange?: (val: string) => void
        className?: string
      }) => (
        <input
          data-testid="command-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={className}
        />
      ),
      List: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="command-list" className={className}>
          {children}
        </div>
      ),
      Empty: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="command-empty" className={className}>
          {children}
        </div>
      ),
      Group: ({
        children,
        heading,
        className,
      }: {
        children: React.ReactNode
        heading?: string
        className?: string
      }) => (
        <div data-testid="command-group" className={className}>
          {heading && <span>{heading}</span>}
          {children}
        </div>
      ),
      Item: ({
        children,
        value,
        onSelect,
        className,
      }: {
        children: React.ReactNode
        value?: string
        onSelect?: () => void
        className?: string
      }) => (
        <div
          data-testid={`command-item-${value}`}
          onClick={onSelect}
          className={className}
          role="option"
        >
          {children}
        </div>
      ),
      Separator: ({ className }: { className?: string }) => (
        <hr data-testid="command-separator" className={className} />
      ),
    }
  ),
}))

describe('CommandPalette', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open is true', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('command')).toBeInTheDocument()
  })

  it('should not render when open is false', () => {
    render(<CommandPalette open={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('should render search input with placeholder', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByTestId('command-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', '搜尋功能或執行命令...')
  })

  it('should update search value on input change', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByTestId('command-input')
    fireEvent.change(input, { target: { value: '測試' } })

    expect(input).toHaveValue('測試')
  })

  it('should render navigation commands when no search results', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    // Check for navigation items
    expect(screen.getByTestId('command-item-前往儀表板')).toBeInTheDocument()
    expect(screen.getByTestId('command-item-前往審核佇列')).toBeInTheDocument()
    expect(screen.getByTestId('command-item-前往產品總覽')).toBeInTheDocument()
  })

  it('should call router.push when navigation item is clicked', async () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    const dashboardItem = screen.getByTestId('command-item-前往儀表板')
    fireEvent.click(dashboardItem)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should render quick actions', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByTestId('command-item-reload')).toBeInTheDocument()
  })

  it('should render footer with keyboard hints', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText(/提示/)).toBeInTheDocument()
    expect(screen.getByText(/Enter/)).toBeInTheDocument()
    expect(screen.getByText(/Esc/)).toBeInTheDocument()
  })

  it('should show empty state message when no results', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByTestId('command-empty')).toBeInTheDocument()
    expect(screen.getByText('未找到相關結果')).toBeInTheDocument()
  })
})

describe('CommandPalette with search results', () => {
  const mockOnOpenChange = vi.fn()
  const mockAddToHistory = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock with search results
    const { useCommandSearch, useSearchHistory } = vi.mocked(
      await import('@/hooks/useCommandSearch')
    )
    ;(useCommandSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      results: [
        {
          id: '1',
          type: 'product',
          title: '測試產品',
          subtitle: '品牌A',
          metadata: '條碼: 123456',
          action: vi.fn(),
        },
      ],
      isSearching: false,
    })
    ;(useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      history: ['之前搜尋'],
      addToHistory: mockAddToHistory,
      clearHistory: vi.fn(),
    })
  })

  it('should render product search results', async () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    await waitFor(() => {
      expect(screen.getByText('測試產品')).toBeInTheDocument()
    })
  })
})

describe('CommandPalette loading state', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useCommandSearch } = vi.mocked(await import('@/hooks/useCommandSearch'))
    ;(useCommandSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      results: [],
      isSearching: true,
    })
  })

  it('should show loading indicator when searching', async () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />)

    await waitFor(() => {
      expect(screen.getByText('搜尋中...')).toBeInTheDocument()
    })
  })
})
