import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TimeRangePickerV2, {
  type TimeRangeValue,
  type TimeRangePreset,
} from '@/components/monitoring/TimeRangePickerV2'

// Mock headlessui
vi.mock('@headlessui/react', () => ({
  Listbox: Object.assign(
    ({
      children,
      value,
      onChange,
    }: {
      children: React.ReactNode
      value: string
      onChange: (v: string) => void
    }) => (
      <div data-testid="listbox">
        {typeof children === 'function'
          ? children({ open: false })
          : children}
      </div>
    ),
    {
      Button: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <button data-testid="listbox-button" className={className}>
          {typeof children === 'function'
            ? children({ open: false })
            : children}
        </button>
      ),
      Options: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <ul data-testid="listbox-options" className={className}>
          {children}
        </ul>
      ),
      Option: ({
        children,
        value,
        className,
      }: {
        children: React.ReactNode | ((props: { active: boolean; selected: boolean }) => React.ReactNode)
        value: string
        className?: string | ((props: { active: boolean }) => string)
      }) => (
        <li
          data-testid={`listbox-option-${value}`}
          data-value={value}
          className={typeof className === 'function' ? className({ active: false }) : className}
        >
          {typeof children === 'function'
            ? children({ active: false, selected: false })
            : children}
        </li>
      ),
    }
  ),
  Transition: ({ children, show }: { children: React.ReactNode; show?: boolean }) => (
    <div data-testid="transition">{children}</div>
  ),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => '01/15 10:00'),
  subHours: vi.fn((date, hours) => new Date(Date.now() - hours * 60 * 60 * 1000)),
  subDays: vi.fn((date, days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)),
  startOfDay: vi.fn((date) => new Date(date.setHours(0, 0, 0, 0))),
  endOfDay: vi.fn((date) => new Date(date.setHours(23, 59, 59, 999))),
}))

vi.mock('date-fns/locale', () => ({
  zhTW: {},
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  ChevronDown: () => <span data-testid="chevron-icon">▼</span>,
  Clock: () => <span data-testid="clock-icon">🕐</span>,
}))

describe('TimeRangePickerV2', () => {
  const mockOnChange = vi.fn()
  const defaultValue: TimeRangeValue = {
    preset: '24h',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<TimeRangePickerV2 value={defaultValue} onChange={mockOnChange} />)

      expect(screen.getByTestId('listbox')).toBeInTheDocument()
      expect(screen.getByTestId('listbox-button')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(
        <TimeRangePickerV2
          value={defaultValue}
          onChange={mockOnChange}
          className="custom-class"
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render all preset options', () => {
      render(<TimeRangePickerV2 value={defaultValue} onChange={mockOnChange} />)

      expect(screen.getByTestId('listbox-option-1h')).toBeInTheDocument()
      expect(screen.getByTestId('listbox-option-6h')).toBeInTheDocument()
      expect(screen.getByTestId('listbox-option-24h')).toBeInTheDocument()
      expect(screen.getByTestId('listbox-option-7d')).toBeInTheDocument()
      expect(screen.getByTestId('listbox-option-30d')).toBeInTheDocument()
      expect(screen.getByTestId('listbox-option-custom')).toBeInTheDocument()
    })

    it('should render icons', () => {
      render(<TimeRangePickerV2 value={defaultValue} onChange={mockOnChange} />)

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument()
    })
  })

  describe('Display', () => {
    it('should display preset label for preset values', () => {
      const presets: Array<{ value: TimeRangePreset; label: string }> = [
        { value: '1h', label: '最近 1 小時' },
        { value: '6h', label: '最近 6 小時' },
        { value: '24h', label: '最近 24 小時' },
        { value: '7d', label: '最近 7 天' },
        { value: '30d', label: '最近 30 天' },
      ]

      presets.forEach(({ value, label }) => {
        const { unmount } = render(
          <TimeRangePickerV2
            value={{ preset: value }}
            onChange={mockOnChange}
          />
        )

        expect(screen.getByText(label)).toBeInTheDocument()
        unmount()
      })
    })

    it('should display custom range when preset is custom', () => {
      const customValue: TimeRangeValue = {
        preset: 'custom',
        custom: {
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-16T10:00:00'),
        },
      }

      render(<TimeRangePickerV2 value={customValue} onChange={mockOnChange} />)

      // The mocked format returns '01/15 10:00' for both dates
      expect(screen.getByText('01/15 10:00 ~ 01/15 10:00')).toBeInTheDocument()
    })
  })

  describe('Value changes', () => {
    it('should have correct value attribute on options', () => {
      render(<TimeRangePickerV2 value={defaultValue} onChange={mockOnChange} />)

      expect(screen.getByTestId('listbox-option-1h')).toHaveAttribute('data-value', '1h')
      expect(screen.getByTestId('listbox-option-6h')).toHaveAttribute('data-value', '6h')
      expect(screen.getByTestId('listbox-option-24h')).toHaveAttribute('data-value', '24h')
      expect(screen.getByTestId('listbox-option-7d')).toHaveAttribute('data-value', '7d')
      expect(screen.getByTestId('listbox-option-30d')).toHaveAttribute('data-value', '30d')
      expect(screen.getByTestId('listbox-option-custom')).toHaveAttribute('data-value', 'custom')
    })
  })
})
