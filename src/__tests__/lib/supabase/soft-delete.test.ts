/**
 * Soft Delete Filtering Utilities Tests
 */
import { describe, it, expect, vi } from 'vitest'
import {
  SOFT_DELETE_ENABLED_TABLES,
  isSoftDeleteEnabled,
  withoutSoftDeleted,
  withSoftDeleteFilter,
  onlySoftDeleted,
  withAllRecords,
  applySoftDeleteFilter,
  isSoftDeleted,
  isActive,
  filterActive,
  filterDeleted,
} from '@/lib/supabase/soft-delete'

describe('SOFT_DELETE_ENABLED_TABLES', () => {
  it('應該包含 P0 表格', () => {
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('users')
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('mcp_products')
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('mcp_ocr_records')
  })

  it('應該包含 P1 表格', () => {
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('mcp_additives')
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('service_api_keys')
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('brands')
  })

  it('應該包含 P2 表格', () => {
    expect(SOFT_DELETE_ENABLED_TABLES).toContain('failed_payloads')
  })
})

describe('isSoftDeleteEnabled', () => {
  it('應該回傳 true 對於支援軟刪除的表格', () => {
    expect(isSoftDeleteEnabled('users')).toBe(true)
    expect(isSoftDeleteEnabled('mcp_products')).toBe(true)
    expect(isSoftDeleteEnabled('mcp_ocr_records')).toBe(true)
  })

  it('應該回傳 false 對於不支援軟刪除的表格', () => {
    expect(isSoftDeleteEnabled('unknown_table')).toBe(false)
    expect(isSoftDeleteEnabled('some_other_table')).toBe(false)
  })
})

describe('withoutSoftDeleted', () => {
  it('應該對查詢套用 soft_deleted_at IS NULL 過濾', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
    }

    const result = withoutSoftDeleted(mockQuery)

    expect(mockQuery.is).toHaveBeenCalledWith('soft_deleted_at', null)
    expect(result).toBe(mockQuery)
  })
})

describe('withSoftDeleteFilter', () => {
  it('includeDeleted=false 時應該套用軟刪除過濾', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
    }

    withSoftDeleteFilter(mockQuery, false)

    expect(mockQuery.is).toHaveBeenCalledWith('soft_deleted_at', null)
  })

  it('includeDeleted=true 時不應該套用任何過濾', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
    }

    const result = withSoftDeleteFilter(mockQuery, true)

    expect(mockQuery.is).not.toHaveBeenCalled()
    expect(result).toBe(mockQuery)
  })

  it('預設應該排除軟刪除的記錄', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
    }

    withSoftDeleteFilter(mockQuery)

    expect(mockQuery.is).toHaveBeenCalledWith('soft_deleted_at', null)
  })
})

describe('onlySoftDeleted', () => {
  it('應該對查詢套用 soft_deleted_at IS NOT NULL 過濾', () => {
    const mockQuery = {
      not: vi.fn().mockReturnThis(),
    }

    const result = onlySoftDeleted(mockQuery)

    expect(mockQuery.not).toHaveBeenCalledWith('soft_deleted_at', 'is', null)
    expect(result).toBe(mockQuery)
  })
})

describe('withAllRecords', () => {
  it('應該直接回傳原始查詢不做修改', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
    }

    const result = withAllRecords(mockQuery)

    expect(mockQuery.is).not.toHaveBeenCalled()
    expect(mockQuery.not).not.toHaveBeenCalled()
    expect(result).toBe(mockQuery)
  })
})

describe('applySoftDeleteFilter', () => {
  it('預設應該排除軟刪除的記錄', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
    }

    applySoftDeleteFilter(mockQuery)

    expect(mockQuery.is).toHaveBeenCalledWith('soft_deleted_at', null)
  })

  it('onlyDeleted=true 時應該只回傳已刪除的記錄', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
    }

    applySoftDeleteFilter(mockQuery, { onlyDeleted: true })

    expect(mockQuery.not).toHaveBeenCalledWith('soft_deleted_at', 'is', null)
    expect(mockQuery.is).not.toHaveBeenCalled()
  })

  it('includeDeleted=true 時不應該套用任何過濾', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
    }

    const result = applySoftDeleteFilter(mockQuery, { includeDeleted: true })

    expect(mockQuery.is).not.toHaveBeenCalled()
    expect(mockQuery.not).not.toHaveBeenCalled()
    expect(result).toBe(mockQuery)
  })

  it('onlyDeleted 優先於 includeDeleted', () => {
    const mockQuery = {
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
    }

    applySoftDeleteFilter(mockQuery, { onlyDeleted: true, includeDeleted: true })

    expect(mockQuery.not).toHaveBeenCalledWith('soft_deleted_at', 'is', null)
    expect(mockQuery.is).not.toHaveBeenCalled()
  })
})

describe('isSoftDeleted', () => {
  it('應該回傳 true 當 soft_deleted_at 有值', () => {
    expect(isSoftDeleted({ soft_deleted_at: '2024-01-01T00:00:00Z' })).toBe(true)
  })

  it('應該回傳 false 當 soft_deleted_at 為 null', () => {
    expect(isSoftDeleted({ soft_deleted_at: null })).toBe(false)
  })

  it('應該回傳 false 當 soft_deleted_at 為 undefined', () => {
    expect(isSoftDeleted({ soft_deleted_at: undefined })).toBe(false)
  })

  it('應該回傳 false 當 soft_deleted_at 欄位不存在', () => {
    expect(isSoftDeleted({})).toBe(false)
  })
})

describe('isActive', () => {
  it('應該回傳 true 當記錄未被軟刪除', () => {
    expect(isActive({ soft_deleted_at: null })).toBe(true)
    expect(isActive({ soft_deleted_at: undefined })).toBe(true)
    expect(isActive({})).toBe(true)
  })

  it('應該回傳 false 當記錄已被軟刪除', () => {
    expect(isActive({ soft_deleted_at: '2024-01-01T00:00:00Z' })).toBe(false)
  })
})

describe('filterActive', () => {
  it('應該過濾出所有活動記錄', () => {
    const records = [
      { id: 1, soft_deleted_at: null },
      { id: 2, soft_deleted_at: '2024-01-01T00:00:00Z' },
      { id: 3, soft_deleted_at: undefined },
      { id: 4, soft_deleted_at: '2024-02-01T00:00:00Z' },
      { id: 5, soft_deleted_at: null },
    ]

    const result = filterActive(records)

    expect(result).toHaveLength(3)
    expect(result.map((r) => r.id)).toEqual([1, 3, 5])
  })

  it('空陣列應該回傳空陣列', () => {
    expect(filterActive([])).toEqual([])
  })

  it('所有記錄都被刪除時應該回傳空陣列', () => {
    const records = [
      { id: 1, soft_deleted_at: '2024-01-01T00:00:00Z' },
      { id: 2, soft_deleted_at: '2024-02-01T00:00:00Z' },
    ]

    expect(filterActive(records)).toEqual([])
  })
})

describe('filterDeleted', () => {
  it('應該過濾出所有已刪除記錄', () => {
    const records = [
      { id: 1, soft_deleted_at: null },
      { id: 2, soft_deleted_at: '2024-01-01T00:00:00Z' },
      { id: 3, soft_deleted_at: undefined },
      { id: 4, soft_deleted_at: '2024-02-01T00:00:00Z' },
      { id: 5, soft_deleted_at: null },
    ]

    const result = filterDeleted(records)

    expect(result).toHaveLength(2)
    expect(result.map((r) => r.id)).toEqual([2, 4])
  })

  it('空陣列應該回傳空陣列', () => {
    expect(filterDeleted([])).toEqual([])
  })

  it('所有記錄都是活動時應該回傳空陣列', () => {
    const records = [
      { id: 1, soft_deleted_at: null },
      { id: 2, soft_deleted_at: undefined },
    ]

    expect(filterDeleted(records)).toEqual([])
  })
})
