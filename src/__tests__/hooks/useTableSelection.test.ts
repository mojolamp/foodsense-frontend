/**
 * useTableSelection Hook Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableSelection } from '@/hooks/useTableSelection'

describe('useTableSelection', () => {
  const mockData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]

  describe('初始化', () => {
    it('應該使用空的選取集合初始化', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      expect(result.current.selectedIds.size).toBe(0)
      expect(result.current.selectedCount).toBe(0)
    })

    it('應該使用初始選取的 ID 初始化', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1', '2'] })
      )

      expect(result.current.selectedIds.size).toBe(2)
      expect(result.current.isSelected('1')).toBe(true)
      expect(result.current.isSelected('2')).toBe(true)
      expect(result.current.isSelected('3')).toBe(false)
    })

    it('應該使用初始 activeId 初始化', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialActiveId: '2' })
      )

      expect(result.current.activeId).toBe('2')
      expect(result.current.activeIndex).toBe(1)
    })

    it('空資料應該設定 activeId 為 null', () => {
      const { result } = renderHook(() => useTableSelection([]))

      expect(result.current.activeId).toBe(null)
      expect(result.current.activeIndex).toBe(-1)
    })

    it('有資料時應該自動設定第一筆為 active', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      expect(result.current.activeId).toBe('1')
      expect(result.current.activeIndex).toBe(0)
    })
  })

  describe('toggleSelect', () => {
    it('應該能夠選取未選取的項目', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.toggleSelect('1')
      })

      expect(result.current.isSelected('1')).toBe(true)
      expect(result.current.selectedCount).toBe(1)
    })

    it('應該能夠取消選取已選取的項目', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1'] })
      )

      act(() => {
        result.current.toggleSelect('1')
      })

      expect(result.current.isSelected('1')).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })

    it('應該能夠選取多個項目', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.toggleSelect('1')
        result.current.toggleSelect('3')
      })

      expect(result.current.isSelected('1')).toBe(true)
      expect(result.current.isSelected('2')).toBe(false)
      expect(result.current.isSelected('3')).toBe(true)
      expect(result.current.selectedCount).toBe(2)
    })
  })

  describe('toggleSelectActive', () => {
    it('應該切換當前 active 項目的選取狀態', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialActiveId: '2' })
      )

      act(() => {
        result.current.toggleSelectActive()
      })

      expect(result.current.isSelected('2')).toBe(true)
    })

    it('空資料時不應該有任何效果', () => {
      const { result } = renderHook(() => useTableSelection([]))

      act(() => {
        result.current.toggleSelectActive()
      })

      expect(result.current.selectedCount).toBe(0)
    })
  })

  describe('toggleSelectAll', () => {
    it('應該全選所有項目', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.toggleSelectAll()
      })

      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.selectedCount).toBe(3)
    })

    it('全選時再次呼叫應該取消全選', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1', '2', '3'] })
      )

      act(() => {
        result.current.toggleSelectAll()
      })

      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })

    it('部分選取時應該全選', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1'] })
      )

      act(() => {
        result.current.toggleSelectAll()
      })

      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.selectedCount).toBe(3)
    })

    it('空資料時不應該有任何效果', () => {
      const { result } = renderHook(() => useTableSelection([]))

      act(() => {
        result.current.toggleSelectAll()
      })

      expect(result.current.selectedCount).toBe(0)
    })
  })

  describe('clearSelection', () => {
    it('應該清除所有選取', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1', '2', '3'] })
      )

      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
    })
  })

  describe('setActiveId', () => {
    it('應該能設定 activeId', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.setActiveId('3')
      })

      expect(result.current.activeId).toBe('3')
      expect(result.current.activeIndex).toBe(2)
    })

    it('應該能設定 activeId 為 null', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.setActiveId(null)
      })

      expect(result.current.activeId).toBe(null)
    })
  })

  describe('setActiveIndex', () => {
    it('應該能設定 activeIndex', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.setActiveIndex(2)
      })

      expect(result.current.activeIndex).toBe(2)
      expect(result.current.activeId).toBe('3')
    })

    it('負數索引應該被限制為 0', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.setActiveIndex(-5)
      })

      expect(result.current.activeIndex).toBe(0)
      expect(result.current.activeId).toBe('1')
    })

    it('超出範圍的索引應該被限制為最後一筆', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.setActiveIndex(100)
      })

      expect(result.current.activeIndex).toBe(2)
      expect(result.current.activeId).toBe('3')
    })

    it('空資料時不應該有任何效果', () => {
      const { result } = renderHook(() => useTableSelection([]))

      act(() => {
        result.current.setActiveIndex(0)
      })

      expect(result.current.activeId).toBe(null)
    })
  })

  describe('setSelectedIds', () => {
    it('應該能直接設定選取的 ID', () => {
      const { result } = renderHook(() => useTableSelection(mockData))

      act(() => {
        result.current.setSelectedIds(new Set(['1', '3']))
      })

      expect(result.current.selectedCount).toBe(2)
      expect(result.current.isSelected('1')).toBe(true)
      expect(result.current.isSelected('3')).toBe(true)
    })
  })

  describe('isAllSelected', () => {
    it('全部選取時應該回傳 true', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1', '2', '3'] })
      )

      expect(result.current.isAllSelected).toBe(true)
    })

    it('部分選取時應該回傳 false', () => {
      const { result } = renderHook(() =>
        useTableSelection(mockData, { initialSelectedIds: ['1', '2'] })
      )

      expect(result.current.isAllSelected).toBe(false)
    })

    it('空資料時應該回傳 false', () => {
      const { result } = renderHook(() => useTableSelection([]))

      expect(result.current.isAllSelected).toBe(false)
    })
  })

  describe('資料變動時的行為', () => {
    it('資料變動時應該清理不存在的選取項', () => {
      const { result, rerender } = renderHook(
        ({ data }) => useTableSelection(data, { initialSelectedIds: ['1', '2', '3'] }),
        { initialProps: { data: mockData } }
      )

      expect(result.current.selectedCount).toBe(3)

      // 移除 id='3' 的項目
      rerender({ data: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }] })

      expect(result.current.selectedCount).toBe(2)
      expect(result.current.isSelected('3')).toBe(false)
    })

    it('資料清空時應該重設所有狀態', () => {
      const { result, rerender } = renderHook(
        ({ data }) => useTableSelection(data, { initialSelectedIds: ['1'] }),
        { initialProps: { data: mockData } }
      )

      rerender({ data: [] })

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.activeId).toBe(null)
      expect(result.current.activeIndex).toBe(-1)
    })

    it('activeId 不存在時應該設為第一筆', () => {
      const { result, rerender } = renderHook(
        ({ data }) => useTableSelection(data, { initialActiveId: '3' }),
        { initialProps: { data: mockData } }
      )

      expect(result.current.activeId).toBe('3')

      // 移除 id='3' 的項目
      rerender({ data: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }] })

      expect(result.current.activeId).toBe('1')
    })
  })

  describe('自定義 idKey', () => {
    const customData = [
      { customId: 'a', name: 'Item A' },
      { customId: 'b', name: 'Item B' },
    ]

    it('應該使用自定義的 idKey', () => {
      const { result } = renderHook(() =>
        useTableSelection(customData, { idKey: 'customId' })
      )

      act(() => {
        result.current.toggleSelect('a')
      })

      expect(result.current.isSelected('a')).toBe(true)
      expect(result.current.activeId).toBe('a')
    })

    it('toggleSelectAll 應該使用自定義的 idKey', () => {
      const { result } = renderHook(() =>
        useTableSelection(customData, { idKey: 'customId' })
      )

      act(() => {
        result.current.toggleSelectAll()
      })

      expect(result.current.isSelected('a')).toBe(true)
      expect(result.current.isSelected('b')).toBe(true)
    })
  })
})
