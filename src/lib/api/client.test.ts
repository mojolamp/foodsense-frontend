import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient, APIError } from './client'

describe('apiClient', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('get', () => {
    it('應該成功發送 GET 請求並返回資料', async () => {
      const mockData = { id: 1, name: 'test' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await apiClient.get('/test')

      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('應該在 API 錯誤時拋出 APIError', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ detail: 'Not found' })),
      })

      await expect(apiClient.get('/not-found')).rejects.toThrow(APIError)
    })
  })

  describe('post', () => {
    it('應該成功發送 POST 請求', async () => {
      const mockData = { id: 1, created: true }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await apiClient.post('/create', { name: 'test' })

      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      )
    })
  })

  describe('retry mechanism', () => {
    it('應該在 503 錯誤時重試', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 503,
            text: () => Promise.resolve(JSON.stringify({ detail: 'Service unavailable' })),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      })

      const resultPromise = apiClient.get('/retry-test')

      // 快進重試延遲時間
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(4000)

      const result = await resultPromise

      expect(result).toEqual({ success: true })
      expect(callCount).toBe(3)
    })
  })
})

describe('APIError', () => {
  it('應該正確設定錯誤屬性', () => {
    const error = new APIError('Test error', 500, 'SERVER_ERROR')

    expect(error.message).toBe('Test error')
    expect(error.status).toBe(500)
    expect(error.code).toBe('SERVER_ERROR')
    expect(error.name).toBe('APIError')
  })
})
