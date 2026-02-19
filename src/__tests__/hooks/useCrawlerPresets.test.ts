/**
 * useCrawlerPresets Hook Tests
 * localStorage-backed preset CRUD
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCrawlerPresets } from '@/hooks/useCrawlerPresets'

const STORAGE_KEY = 'foodsense:crawler-presets'

// Node.js 22 built-in localStorage is a Proxy that doesn't support .clear().
// Replace it with a simple in-memory mock that matches the Storage interface.
const store: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { for (const k of Object.keys(store)) delete store[k] },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null,
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

// Polyfill crypto.randomUUID for test env
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    configurable: true,
  })
} else if (typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    configurable: true,
  })
}

describe('useCrawlerPresets', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('應該初始化為空陣列', () => {
    const { result } = renderHook(() => useCrawlerPresets())
    expect(result.current.presets).toEqual([])
  })

  it('應該從 localStorage 載入既有 presets', async () => {
    const existing = [
      {
        id: 'preset-1',
        name: 'Test Preset',
        keywords: ['豆腐', '牛奶'],
        sites: ['pchome'],
        limitPerKeyword: 10,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    const { result } = renderHook(() => useCrawlerPresets())

    await waitFor(() => {
      expect(result.current.presets).toHaveLength(1)
      expect(result.current.presets[0].name).toBe('Test Preset')
    })
  })

  it('localStorage 內容無效時應該初始化為空陣列', async () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json-!!!')

    const { result } = renderHook(() => useCrawlerPresets())

    await waitFor(() => {
      expect(result.current.presets).toEqual([])
    })
  })

  describe('savePreset', () => {
    it('應該儲存新的 preset', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      act(() => {
        result.current.savePreset({
          name: 'My Preset',
          keywords: ['醬油', '味噌'],
          sites: ['pchome', 'momoshop'],
          limitPerKeyword: 5,
        })
      })

      expect(result.current.presets).toHaveLength(1)
      expect(result.current.presets[0].name).toBe('My Preset')
      expect(result.current.presets[0].keywords).toEqual(['醬油', '味噌'])
      expect(result.current.presets[0].sites).toEqual(['pchome', 'momoshop'])
      expect(result.current.presets[0].limitPerKeyword).toBe(5)
      expect(result.current.presets[0].id).toBeTruthy()
      expect(result.current.presets[0].createdAt).toBeTruthy()
    })

    it('應該同步寫入 localStorage', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      act(() => {
        result.current.savePreset({
          name: 'Saved',
          keywords: ['test'],
          sites: [],
          limitPerKeyword: 10,
        })
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].name).toBe('Saved')
    })

    it('新的 preset 應該在前面（LIFO）', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      act(() => {
        result.current.savePreset({
          name: 'First',
          keywords: ['a'],
          sites: [],
          limitPerKeyword: 1,
        })
      })

      act(() => {
        result.current.savePreset({
          name: 'Second',
          keywords: ['b'],
          sites: [],
          limitPerKeyword: 2,
        })
      })

      expect(result.current.presets).toHaveLength(2)
      expect(result.current.presets[0].name).toBe('Second')
      expect(result.current.presets[1].name).toBe('First')
    })

    it('應該回傳新建立的 preset', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      let created: ReturnType<typeof result.current.savePreset> | undefined
      act(() => {
        created = result.current.savePreset({
          name: 'Return Test',
          keywords: ['x'],
          sites: ['y'],
          limitPerKeyword: 3,
        })
      })

      expect(created).toBeDefined()
      expect(created!.name).toBe('Return Test')
      expect(created!.id).toBeTruthy()
    })
  })

  describe('deletePreset', () => {
    it('應該刪除指定的 preset', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      let presetId: string
      act(() => {
        const p = result.current.savePreset({
          name: 'To Delete',
          keywords: ['del'],
          sites: [],
          limitPerKeyword: 1,
        })
        presetId = p.id
      })

      expect(result.current.presets).toHaveLength(1)

      act(() => {
        result.current.deletePreset(presetId)
      })

      expect(result.current.presets).toHaveLength(0)
    })

    it('刪除後應該同步更新 localStorage', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      let presetId: string
      act(() => {
        const p = result.current.savePreset({
          name: 'To Delete',
          keywords: ['del'],
          sites: [],
          limitPerKeyword: 1,
        })
        presetId = p.id
      })

      act(() => {
        result.current.deletePreset(presetId)
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored).toHaveLength(0)
    })

    it('刪除不存在的 ID 不應該有影響', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      act(() => {
        result.current.savePreset({
          name: 'Keep',
          keywords: ['k'],
          sites: [],
          limitPerKeyword: 1,
        })
      })

      act(() => {
        result.current.deletePreset('nonexistent-id')
      })

      expect(result.current.presets).toHaveLength(1)
    })
  })

  describe('updatePreset', () => {
    it('應該更新指定 preset 的欄位', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      let presetId: string
      act(() => {
        const p = result.current.savePreset({
          name: 'Original',
          keywords: ['old'],
          sites: ['old-site'],
          limitPerKeyword: 5,
        })
        presetId = p.id
      })

      act(() => {
        result.current.updatePreset(presetId, { name: 'Updated Name', keywords: ['new'] })
      })

      expect(result.current.presets[0].name).toBe('Updated Name')
      expect(result.current.presets[0].keywords).toEqual(['new'])
      // Unchanged fields preserved
      expect(result.current.presets[0].sites).toEqual(['old-site'])
      expect(result.current.presets[0].limitPerKeyword).toBe(5)
    })

    it('更新應該更新 updatedAt 時間戳', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      let presetId: string
      act(() => {
        const p = result.current.savePreset({
          name: 'Time Test',
          keywords: ['t'],
          sites: [],
          limitPerKeyword: 1,
        })
        presetId = p.id
      })

      act(() => {
        result.current.updatePreset(presetId, { limitPerKeyword: 99 })
      })

      expect(result.current.presets[0].limitPerKeyword).toBe(99)
      expect(result.current.presets[0].updatedAt).toBeTruthy()
    })

    it('更新應該同步寫入 localStorage', () => {
      const { result } = renderHook(() => useCrawlerPresets())

      let presetId: string
      act(() => {
        const p = result.current.savePreset({
          name: 'Sync Test',
          keywords: ['s'],
          sites: [],
          limitPerKeyword: 1,
        })
        presetId = p.id
      })

      act(() => {
        result.current.updatePreset(presetId, { name: 'Synced' })
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored[0].name).toBe('Synced')
    })
  })
})
