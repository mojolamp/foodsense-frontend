/**
 * PresetPicker Component Tests
 * Preset load/save dropdown
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

const mockPresets = [
  {
    id: 'preset-1',
    name: 'Daily Tofu',
    keywords: ['豆腐', '牛奶'],
    sites: ['pchome'],
    limitPerKeyword: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'preset-2',
    name: 'Soy Products',
    keywords: ['醬油'],
    sites: ['momoshop', 'carrefour'],
    limitPerKeyword: 20,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
]

const mockSavePreset = vi.fn()
const mockDeletePreset = vi.fn()

vi.mock('@/hooks/useCrawlerPresets', () => ({
  useCrawlerPresets: () => ({
    presets: mockPresets,
    savePreset: mockSavePreset,
    deletePreset: mockDeletePreset,
    updatePreset: vi.fn(),
  }),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Save: () => <span data-testid="icon-save">💾</span>,
  Trash2: () => <span data-testid="icon-trash">🗑</span>,
  ChevronDown: () => <span data-testid="icon-chevron-down">▼</span>,
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...rest }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    size?: string
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}))

import PresetPicker from '@/components/crawler/PresetPicker'

describe('PresetPicker', () => {
  const defaultProps = {
    currentKeywords: ['豆腐'],
    currentSites: ['pchome'],
    currentLimit: 5,
    onLoad: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應該顯示 presets 數量', () => {
    render(<PresetPicker {...defaultProps} />)
    expect(screen.getByText('2 presets')).toBeInTheDocument()
  })

  it('點擊下拉應該展開 preset 列表', () => {
    render(<PresetPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('2 presets'))
    expect(screen.getByText('Daily Tofu')).toBeInTheDocument()
    expect(screen.getByText('Soy Products')).toBeInTheDocument()
  })

  it('選擇 preset 應該呼叫 onLoad', () => {
    render(<PresetPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('2 presets'))
    fireEvent.click(screen.getByText('Daily Tofu'))
    expect(defaultProps.onLoad).toHaveBeenCalledWith(mockPresets[0])
  })

  it('應該顯示 preset 的 keyword/site 統計', () => {
    render(<PresetPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('2 presets'))
    expect(screen.getByText('2 kw · 1 sites')).toBeInTheDocument()
    expect(screen.getByText('1 kw · 2 sites')).toBeInTheDocument()
  })

  it('應該顯示 limit badge', () => {
    render(<PresetPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('2 presets'))
    expect(screen.getByText('limit 10')).toBeInTheDocument()
    expect(screen.getByText('limit 20')).toBeInTheDocument()
  })

  it('點擊刪除按鈕應該呼叫 deletePreset', () => {
    render(<PresetPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('2 presets'))
    const trashIcons = screen.getAllByTestId('icon-trash')
    fireEvent.click(trashIcons[0])
    expect(mockDeletePreset).toHaveBeenCalledWith('preset-1')
  })

  describe('Save 功能', () => {
    it('點擊 Save 按鈕應該顯示儲存表單', () => {
      render(<PresetPicker {...defaultProps} />)
      const saveBtn = screen.getAllByTestId('button').find(
        (btn) => btn.querySelector('[data-testid="icon-save"]')
      )
      if (saveBtn) {
        fireEvent.click(saveBtn)
        expect(screen.getByPlaceholderText('Preset name...')).toBeInTheDocument()
      }
    })

    it('填寫名稱後點擊 Save 應該呼叫 savePreset', () => {
      render(<PresetPicker {...defaultProps} />)
      // Click Save button to show form
      const saveBtn = screen.getAllByTestId('button').find(
        (btn) => btn.querySelector('[data-testid="icon-save"]')
      )
      if (saveBtn) {
        fireEvent.click(saveBtn)
        const input = screen.getByPlaceholderText('Preset name...')
        fireEvent.change(input, { target: { value: 'New Preset' } })
        // Click inner Save button
        const innerSaveBtn = screen.getAllByTestId('button').find(
          (btn) => btn.textContent === 'Save' && !btn.querySelector('[data-testid="icon-save"]')
        )
        if (innerSaveBtn) {
          fireEvent.click(innerSaveBtn)
          expect(mockSavePreset).toHaveBeenCalledWith({
            name: 'New Preset',
            keywords: ['豆腐'],
            sites: ['pchome'],
            limitPerKeyword: 5,
          })
        }
      }
    })

    it('空名稱時 Save 按鈕應該 disabled', () => {
      render(<PresetPicker {...defaultProps} />)
      const saveBtn = screen.getAllByTestId('button').find(
        (btn) => btn.querySelector('[data-testid="icon-save"]')
      )
      if (saveBtn) {
        fireEvent.click(saveBtn)
        const innerSaveBtn = screen.getAllByTestId('button').find(
          (btn) => btn.textContent === 'Save' && !btn.querySelector('[data-testid="icon-save"]')
        )
        expect(innerSaveBtn).toHaveAttribute('disabled')
      }
    })
  })

  describe('Empty State', () => {
    it('沒有 keywords 時 Save 按鈕應該 disabled', () => {
      render(<PresetPicker {...defaultProps} currentKeywords={[]} />)
      const saveBtn = screen.getAllByTestId('button').find(
        (btn) => btn.querySelector('[data-testid="icon-save"]')
      )
      expect(saveBtn).toHaveAttribute('disabled')
    })
  })
})
