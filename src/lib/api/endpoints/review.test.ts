/**
 * Review API Endpoints Tests
 *
 * @module lib/api/endpoints/review.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reviewAPI } from './review'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('reviewAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getQueue', () => {
    it('should call API without params', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getQueue()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/review/queue')
    })

    it('should call API with params', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getQueue({
        validation_status: 'pending',
        confidence_level: 'high',
        limit: 50,
        offset: 10,
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/review/queue?')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('validation_status=pending')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('confidence_level=high')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=50')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('offset=10')
      )
    })
  })

  describe('submitReview', () => {
    it('should post review data', async () => {
      const mockResponse = { id: 'gt-123' }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const reviewData = {
        ocr_record_id: 'ocr-123',
        product_id: 456,
        data_quality_score: 8,
        confidence_score: 0.9,
      }

      await reviewAPI.submitReview(reviewData)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/admin/review/submit',
        reviewData
      )
    })
  })

  describe('getStats', () => {
    it('should call stats API', async () => {
      const mockResponse = { total: 100, pending: 50 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getStats()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/review/stats')
    })
  })

  describe('getHistory', () => {
    it('should call history API without params', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getHistory()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/review/history')
    })

    it('should call history API with params', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getHistory({ limit: 20, offset: 5 })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('offset=5')
      )
    })
  })

  describe('getGoldSamples', () => {
    it('should call gold samples API', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getGoldSamples()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/review/gold-samples')
    })

    it('should call gold samples API with params', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getGoldSamples({ limit: 10 })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      )
    })
  })

  describe('markAsGold', () => {
    it('should post to mark as gold', async () => {
      const mockResponse = { success: true }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await reviewAPI.markAsGold('gt-123')

      expect(apiClient.post).toHaveBeenCalledWith(
        '/admin/review/gold-samples?gt_id=gt-123',
        {}
      )
    })
  })

  describe('getPersonalMetrics', () => {
    it('should call personal metrics API', async () => {
      const mockResponse = { total_reviews: 100 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getPersonalMetrics()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/review/metrics/personal')
    })
  })

  describe('getTeamMetrics', () => {
    it('should call team metrics API', async () => {
      const mockResponse = { total_team_reviews: 500 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await reviewAPI.getTeamMetrics()

      expect(apiClient.get).toHaveBeenCalledWith('/admin/review/metrics/team')
    })
  })

  describe('batchSubmitReviews', () => {
    it('should post batch reviews', async () => {
      const mockResponse = {
        success: true,
        submitted: 5,
        failed: 0,
        total: 5,
        results: [],
        errors: [],
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const batchData = {
        reviews: [
          { ocr_record_id: 'ocr-1' },
          { ocr_record_id: 'ocr-2' },
        ],
        template: {
          data_quality_score: 8,
          confidence_score: 0.9,
        },
      }

      await reviewAPI.batchSubmitReviews(batchData)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/admin/review/batch-submit',
        batchData
      )
    })
  })
})
