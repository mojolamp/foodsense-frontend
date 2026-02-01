/**
 * Dictionary API Endpoints Tests
 *
 * @module lib/api/endpoints/dictionary.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dictionaryAPI } from './dictionary'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('dictionaryAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTokenRankings', () => {
    it('should call API with default params', async () => {
      const mockResponse = { tokens: [], total: 0 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await dictionaryAPI.getTokenRankings()

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/dictionary/tokens?')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort_by=occurrence')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('order=desc')
      )
    })

    it('should call API with custom params', async () => {
      const mockResponse = { tokens: [], total: 0 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await dictionaryAPI.getTokenRankings({
        sort_by: 'products',
        order: 'asc',
        limit: 100,
        offset: 10,
        search: 'test',
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort_by=products')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('order=asc')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=100')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('offset=10')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=test')
      )
    })
  })

  describe('getTokenDetail', () => {
    it('should call API with encoded token', async () => {
      const mockResponse = { token: 'test', count: 10 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await dictionaryAPI.getTokenDetail('test token')

      expect(apiClient.get).toHaveBeenCalledWith(
        '/admin/dictionary/tokens/test%20token'
      )
    })
  })

  describe('createCorrection', () => {
    it('should post correction data', async () => {
      const mockResponse = { success: true }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const correctionData = {
        original_token: 'test',
        corrected_token: 'corrected',
        reason: 'Typo fix',
      }

      await dictionaryAPI.createCorrection(correctionData)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/admin/dictionary/corrections',
        correctionData
      )
    })
  })

  describe('getStats', () => {
    it('should call stats API', async () => {
      const mockResponse = {
        total_tokens: 100,
        total_corrections: 50,
        avg_token_per_product: 5.5,
        top_errors: [],
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await dictionaryAPI.getStats()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/dictionary/stats')
      expect(result).toEqual(mockResponse)
    })
  })
})
