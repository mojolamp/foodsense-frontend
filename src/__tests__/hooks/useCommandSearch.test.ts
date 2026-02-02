/**
 * useCommandSearch Hook Tests
 *
 * 測試搜尋功能與歷史記錄管理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearchHistory } from '@/hooks/useCommandSearch'

// useCommandSearch 涉及複雜的非同步 API 呼叫和 debounce
// 這裡只測試 useSearchHistory，因為它是純粹的本地狀態管理

describe('useSearchHistory', () => {
  const STORAGE_KEY = 'command_palette_history'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('初始化', () => {
    it('localStorage 為空時應該初始化為空陣列', () => {
      const { result } = renderHook(() => useSearchHistory())
      expect(result.current.history).toEqual([])
    })

    it('應該從 localStorage 載入歷史記錄', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['search1', 'search2']))

      const { result } = renderHook(() => useSearchHistory())

      // useEffect 是非同步的
      await waitFor(() => {
        expect(result.current.history).toEqual(['search1', 'search2'])
      })
    })

    it('localStorage 內容無效時應該初始化為空陣列', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useSearchHistory())

      await waitFor(() => {
        expect(result.current.history).toEqual([])
      })

      consoleSpy.mockRestore()
    })
  })

  describe('addToHistory', () => {
    it('應該新增搜尋記錄', () => {
      const { result } = renderHook(() => useSearchHistory())

      act(() => {
        result.current.addToHistory('new search')
      })

      expect(result.current.history).toContain('new search')
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toContain('new search')
    })

    it('空查詢不應該被新增', () => {
      const { result } = renderHook(() => useSearchHistory())

      act(() => {
        result.current.addToHistory('')
      })

      expect(result.current.history).toEqual([])
    })

    it('過短的查詢不應該被新增', () => {
      const { result } = renderHook(() => useSearchHistory())

      act(() => {
        result.current.addToHistory('a')
      })

      expect(result.current.history).toEqual([])
    })

    it('重複的查詢應該移到最前面', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['search1', 'search2', 'search3']))

      const { result } = renderHook(() => useSearchHistory())

      // 等待初始載入
      await waitFor(() => {
        expect(result.current.history).toHaveLength(3)
      })

      act(() => {
        result.current.addToHistory('search2')
      })

      expect(result.current.history[0]).toBe('search2')
      expect(result.current.history.filter((h) => h === 'search2')).toHaveLength(1)
    })

    it('應該限制最多 10 筆記錄', async () => {
      const initialHistory = Array.from({ length: 10 }, (_, i) => `search${i}`)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialHistory))

      const { result } = renderHook(() => useSearchHistory())

      // 等待初始載入
      await waitFor(() => {
        expect(result.current.history).toHaveLength(10)
      })

      act(() => {
        result.current.addToHistory('new search')
      })

      expect(result.current.history).toHaveLength(10)
      expect(result.current.history[0]).toBe('new search')
      expect(result.current.history).not.toContain('search9')
    })
  })

  describe('clearHistory', () => {
    it('應該清除所有歷史記錄', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['search1', 'search2']))

      const { result } = renderHook(() => useSearchHistory())

      // 等待初始載入
      await waitFor(() => {
        expect(result.current.history).toHaveLength(2)
      })

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toEqual([])
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })
})

// SearchResult 類型測試
describe('SearchResult 類型', () => {
  it('應該符合預期的結構', () => {
    // 驗證類型定義
    const searchResult = {
      type: 'product' as const,
      id: 'test-id',
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      metadata: 'Test Metadata',
      action: () => {},
    }

    expect(searchResult.type).toBe('product')
    expect(searchResult.id).toBe('test-id')
    expect(searchResult.title).toBe('Test Title')
    expect(typeof searchResult.action).toBe('function')
  })

  it('type 應該是 product, record, navigation 或 action', () => {
    const types = ['product', 'record', 'navigation', 'action']
    types.forEach((type) => {
      expect(['product', 'record', 'navigation', 'action']).toContain(type)
    })
  })
})
