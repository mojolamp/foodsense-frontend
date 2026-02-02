/**
 * API Base URLs Configuration Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { API_BASES, validateAPIBases, getAPIBase } from '@/lib/api/baseUrls'

describe('API_BASES', () => {
  it('應該包含 V1 base URL', () => {
    expect(API_BASES.V1).toBeDefined()
    expect(typeof API_BASES.V1).toBe('string')
  })

  it('應該包含 V2 base URL', () => {
    expect(API_BASES.V2).toBeDefined()
    expect(typeof API_BASES.V2).toBe('string')
  })

  it('應該包含 LAWCORE base URL', () => {
    expect(API_BASES.LAWCORE).toBeDefined()
    expect(typeof API_BASES.LAWCORE).toBe('string')
  })

  it('預設值應該是 localhost URLs', () => {
    // 測試環境中沒有設定環境變數，應該使用預設值
    expect(API_BASES.V1).toContain('localhost')
    expect(API_BASES.V2).toContain('localhost')
    expect(API_BASES.LAWCORE).toContain('localhost')
  })
})

describe('validateAPIBases', () => {
  it('應該不拋出錯誤當所有 URL 都有效', () => {
    expect(() => validateAPIBases()).not.toThrow()
  })

  it('應該驗證所有 URL 都是有效的 URL 格式', () => {
    // 預設的 localhost URLs 應該是有效的
    expect(() => validateAPIBases()).not.toThrow()
  })
})

describe('getAPIBase', () => {
  it('應該回傳 V1 base URL', () => {
    const result = getAPIBase('V1')
    expect(result).toBe(API_BASES.V1)
  })

  it('應該回傳 V2 base URL', () => {
    const result = getAPIBase('V2')
    expect(result).toBe(API_BASES.V2)
  })

  it('應該回傳 LAWCORE base URL', () => {
    const result = getAPIBase('LAWCORE')
    expect(result).toBe(API_BASES.LAWCORE)
  })
})

describe('URL 格式驗證', () => {
  it('V1 URL 應該以 /api/v1 結尾', () => {
    expect(API_BASES.V1).toMatch(/\/api\/v1$/)
  })

  it('V2 URL 應該以 /api 結尾', () => {
    expect(API_BASES.V2).toMatch(/\/api$/)
  })

  it('LAWCORE URL 應該以 /api/lawcore 結尾', () => {
    expect(API_BASES.LAWCORE).toMatch(/\/api\/lawcore$/)
  })

  it('所有 URL 應該使用 http 或 https 協議', () => {
    expect(API_BASES.V1).toMatch(/^https?:\/\//)
    expect(API_BASES.V2).toMatch(/^https?:\/\//)
    expect(API_BASES.LAWCORE).toMatch(/^https?:\/\//)
  })
})
