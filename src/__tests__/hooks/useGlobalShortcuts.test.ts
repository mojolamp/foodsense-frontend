/**
 * useGlobalShortcuts Hook Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock react-hotkeys-hook
const hotkeyHandlers: Record<string, (e: KeyboardEvent) => void> = {}

vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: (keys: string, handler: (e: KeyboardEvent) => void, options?: { enableOnFormTags?: boolean }) => {
    hotkeyHandlers[keys] = handler
  },
}))

// Helper to simulate hotkey press
function simulateHotkey(keys: string) {
  const handler = hotkeyHandlers[keys]
  if (handler) {
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent
    handler(mockEvent)
  }
}

describe('useGlobalShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(hotkeyHandlers).forEach((key) => delete hotkeyHandlers[key])
  })

  describe('初始狀態', () => {
    it('應該初始化 Command Palette 為關閉狀態', () => {
      const { result } = renderHook(() => useGlobalShortcuts())

      expect(result.current.isCommandPaletteOpen).toBe(false)
    })
  })

  describe('Command Palette 快捷鍵', () => {
    it('mod+k 應該開啟 Command Palette', () => {
      const { result } = renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('mod+k')
      })

      expect(result.current.isCommandPaletteOpen).toBe(true)
    })

    it('shift+/ 應該開啟 Command Palette', () => {
      const { result } = renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('shift+/')
      })

      expect(result.current.isCommandPaletteOpen).toBe(true)
    })
  })

  describe('導航快捷鍵', () => {
    it('g,d 應該導航到 dashboard', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,d')
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('g,q 應該導航到 review queue', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,q')
      })

      expect(mockPush).toHaveBeenCalledWith('/review/queue')
    })

    it('g,a 應該導航到 review analytics', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,a')
      })

      expect(mockPush).toHaveBeenCalledWith('/review/analytics')
    })

    it('g,h 應該導航到 review history', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,h')
      })

      expect(mockPush).toHaveBeenCalledWith('/review/history')
    })

    it('g,g 應該導航到 gold-samples', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,g')
      })

      expect(mockPush).toHaveBeenCalledWith('/gold-samples')
    })

    it('g,p 應該導航到 products', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,p')
      })

      expect(mockPush).toHaveBeenCalledWith('/products')
    })

    it('g,x 應該導航到 data-quality', () => {
      renderHook(() => useGlobalShortcuts())

      act(() => {
        simulateHotkey('g,x')
      })

      expect(mockPush).toHaveBeenCalledWith('/data-quality')
    })
  })

  describe('setIsCommandPaletteOpen', () => {
    it('應該能手動設定 Command Palette 狀態', () => {
      const { result } = renderHook(() => useGlobalShortcuts())

      act(() => {
        result.current.setIsCommandPaletteOpen(true)
      })

      expect(result.current.isCommandPaletteOpen).toBe(true)

      act(() => {
        result.current.setIsCommandPaletteOpen(false)
      })

      expect(result.current.isCommandPaletteOpen).toBe(false)
    })
  })

  describe('快捷鍵註冊', () => {
    it('應該註冊所有快捷鍵', () => {
      renderHook(() => useGlobalShortcuts())

      // 確認所有快捷鍵都已註冊
      expect(hotkeyHandlers['mod+k']).toBeDefined()
      expect(hotkeyHandlers['g,d']).toBeDefined()
      expect(hotkeyHandlers['g,q']).toBeDefined()
      expect(hotkeyHandlers['g,a']).toBeDefined()
      expect(hotkeyHandlers['g,h']).toBeDefined()
      expect(hotkeyHandlers['g,g']).toBeDefined()
      expect(hotkeyHandlers['g,p']).toBeDefined()
      expect(hotkeyHandlers['g,x']).toBeDefined()
      expect(hotkeyHandlers['shift+/']).toBeDefined()
    })
  })
})
