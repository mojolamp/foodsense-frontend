/**
 * useTableSelection Hook
 *
 * 可複用的表格選取狀態管理 Hook
 * 支援單選、多選、全選/取消全選功能
 *
 * @example
 * const {
 *   selectedIds,
 *   activeId,
 *   setActiveId,
 *   toggleSelect,
 *   toggleSelectAll,
 *   clearSelection,
 *   isSelected,
 *   isAllSelected,
 *   selectedCount,
 * } = useTableSelection(data, { idKey: 'id' })
 */

import { useState, useCallback, useMemo, useEffect } from 'react'

export interface UseTableSelectionOptions<T> {
  /** 用於取得項目 ID 的鍵名，預設為 'id' */
  idKey?: keyof T
  /** 初始選取的 ID 列表 */
  initialSelectedIds?: string[]
  /** 初始 active ID */
  initialActiveId?: string | null
}

export interface UseTableSelectionReturn {
  /** 選取的 ID Set */
  selectedIds: Set<string>
  /** 設定選取的 ID Set */
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  /** 當前 active 的 ID */
  activeId: string | null
  /** 設定 active ID */
  setActiveId: (id: string | null) => void
  /** 當前 active 的 index */
  activeIndex: number
  /** 設定 active index */
  setActiveIndex: (index: number) => void
  /** 切換單一項目的選取狀態 */
  toggleSelect: (id: string) => void
  /** 切換 active 項目的選取狀態 */
  toggleSelectActive: () => void
  /** 切換全選/取消全選 */
  toggleSelectAll: () => void
  /** 清除所有選取 */
  clearSelection: () => void
  /** 檢查項目是否被選取 */
  isSelected: (id: string) => boolean
  /** 是否全部選取 */
  isAllSelected: boolean
  /** 選取的項目數量 */
  selectedCount: number
}

export function useTableSelection<T extends Record<string, unknown>>(
  data: T[],
  options: UseTableSelectionOptions<T> = {}
): UseTableSelectionReturn {
  const { idKey = 'id' as keyof T, initialSelectedIds = [], initialActiveId = null } = options

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds))
  const [activeId, setActiveIdState] = useState<string | null>(initialActiveId)

  // 計算所有有效的 ID
  const validIds = useMemo(() => {
    return new Set(data.map((item) => String(item[idKey])))
  }, [data, idKey])

  // 當資料變動時，清理不存在的選取項
  useEffect(() => {
    if (data.length === 0) {
      setSelectedIds(new Set())
      setActiveIdState(null)
      return
    }

    // 清理不存在的 selectedIds
    setSelectedIds((prev) => {
      let changed = false
      const next = new Set<string>()
      for (const id of prev) {
        if (validIds.has(id)) {
          next.add(id)
        } else {
          changed = true
        }
      }
      return changed ? next : prev
    })

    // 如果 activeId 不存在，設為第一筆
    if (activeId && !validIds.has(activeId)) {
      setActiveIdState(data.length > 0 ? String(data[0][idKey]) : null)
    } else if (!activeId && data.length > 0) {
      setActiveIdState(String(data[0][idKey]))
    }
  }, [data, validIds, activeId, idKey])

  // 計算 active index
  const activeIndex = useMemo(() => {
    if (!activeId) return data.length > 0 ? 0 : -1
    const idx = data.findIndex((item) => String(item[idKey]) === activeId)
    return idx >= 0 ? idx : data.length > 0 ? 0 : -1
  }, [activeId, data, idKey])

  // 設定 active ID
  const setActiveId = useCallback((id: string | null) => {
    setActiveIdState(id)
  }, [])

  // 設定 active index
  const setActiveIndex = useCallback(
    (nextIndex: number) => {
      if (data.length === 0) {
        setActiveIdState(null)
        return
      }
      const idx = Math.max(0, Math.min(data.length - 1, nextIndex))
      setActiveIdState(String(data[idx][idKey]))
    },
    [data, idKey]
  )

  // 切換單一項目的選取狀態
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // 切換 active 項目的選取狀態
  const toggleSelectActive = useCallback(() => {
    if (data.length === 0 || activeIndex < 0) return
    const record = data[activeIndex]
    if (!record) return
    toggleSelect(String(record[idKey]))
  }, [data, activeIndex, idKey, toggleSelect])

  // 切換全選/取消全選
  const toggleSelectAll = useCallback(() => {
    if (data.length === 0) return

    setSelectedIds((prev) => {
      const ids = data.map((item) => String(item[idKey]))
      const isAllSelected = ids.length > 0 && ids.every((id) => prev.has(id))

      if (isAllSelected) {
        // 取消全選
        const next = new Set(prev)
        for (const id of ids) {
          next.delete(id)
        }
        return next
      } else {
        // 全選
        const next = new Set(prev)
        for (const id of ids) {
          next.add(id)
        }
        return next
      }
    })
  }, [data, idKey])

  // 清除所有選取
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // 檢查項目是否被選取
  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id)
    },
    [selectedIds]
  )

  // 是否全部選取
  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false
    return data.every((item) => selectedIds.has(String(item[idKey])))
  }, [data, selectedIds, idKey])

  // 選取的項目數量
  const selectedCount = selectedIds.size

  return {
    selectedIds,
    setSelectedIds,
    activeId,
    setActiveId,
    activeIndex,
    setActiveIndex,
    toggleSelect,
    toggleSelectActive,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectedCount,
  }
}
