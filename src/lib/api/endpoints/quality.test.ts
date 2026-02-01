/**
 * Quality API Endpoints Tests
 *
 * @module lib/api/endpoints/quality.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { qualityAPI } from './quality'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('qualityAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOverview', () => {
    it('should call overview API', async () => {
      const mockResponse = { total: 100, quality_score: 85 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await qualityAPI.getOverview()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/quality/overview')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCoverage', () => {
    it('should call coverage API', async () => {
      const mockResponse = [{ field: 'name', coverage: 95 }]
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await qualityAPI.getCoverage()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/quality/coverage')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getSourceContribution', () => {
    it('should call sources API', async () => {
      const mockResponse = [{ source: 'usda', count: 1000 }]
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await qualityAPI.getSourceContribution()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/quality/sources')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTimeline', () => {
    it('should call timeline API with default days', async () => {
      const mockResponse = [{ date: '2024-01-01', count: 50 }]
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await qualityAPI.getTimeline()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/quality/timeline?days=30')
      expect(result).toEqual(mockResponse)
    })

    it('should call timeline API with custom days', async () => {
      const mockResponse = [{ date: '2024-01-01', count: 50 }]
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await qualityAPI.getTimeline(7)

      expect(apiClient.get).toHaveBeenCalledWith('/admin/quality/timeline?days=7')
    })
  })
})
