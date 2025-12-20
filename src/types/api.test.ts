import { describe, it, expect } from 'vitest'
import { isAPIError, getErrorMessage } from './api'

describe('isAPIError', () => {
  it('應該識別有效的 APIError 物件', () => {
    const error = { message: 'Test error', status: 400 }
    expect(isAPIError(error)).toBe(true)
  })

  it('應該拒絕沒有 message 的物件', () => {
    const error = { status: 400 }
    expect(isAPIError(error)).toBe(false)
  })

  it('應該拒絕 null', () => {
    expect(isAPIError(null)).toBe(false)
  })

  it('應該拒絕非物件類型', () => {
    expect(isAPIError('error')).toBe(false)
    expect(isAPIError(123)).toBe(false)
    expect(isAPIError(undefined)).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('應該從 APIError 取得訊息', () => {
    const error = { message: 'API 錯誤', status: 500 }
    expect(getErrorMessage(error)).toBe('API 錯誤')
  })

  it('應該從 Error 實例取得訊息', () => {
    const error = new Error('一般錯誤')
    expect(getErrorMessage(error)).toBe('一般錯誤')
  })

  it('應該對未知錯誤返回預設訊息', () => {
    expect(getErrorMessage(null)).toBe('發生未知錯誤')
    expect(getErrorMessage(undefined)).toBe('發生未知錯誤')
    expect(getErrorMessage('string error')).toBe('發生未知錯誤')
  })
})
