/**
 * Ingestion Gate API Endpoints Tests
 *
 * @module lib/api/endpoints/ingestionGate.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ingestionGateAPI } from './ingestionGate'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('ingestionGateAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReviewQueue', () => {
    it('should call API without filters', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await ingestionGateAPI.getReviewQueue()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/review-queue?')
    })

    it('should call API with filters', async () => {
      const mockResponse: unknown[] = []
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await ingestionGateAPI.getReviewQueue({
        status: 'pending',
        priority: 1,
        limit: 50,
        offset: 10,
        decision: 'approve',
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=pending')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('priority=1')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=50')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('offset=10')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('decision=approve')
      )
    })

    it('should handle array response', async () => {
      const mockItems = [{ id: '1' }, { id: '2' }]
      vi.mocked(apiClient.get).mockResolvedValue(mockItems)

      const result = await ingestionGateAPI.getReviewQueue()

      expect(result).toEqual(mockItems)
    })

    it('should handle wrapped response', async () => {
      const mockItems = [{ id: '1' }, { id: '2' }]
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockItems })

      const result = await ingestionGateAPI.getReviewQueue()

      expect(result).toEqual(mockItems)
    })
  })

  describe('getReviewDetail', () => {
    it('should call API with review ID', async () => {
      const mockResponse = { data: { id: 'review-123' } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await ingestionGateAPI.getReviewDetail('review-123')

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/review-queue/review-123')
      expect(result).toEqual({ id: 'review-123' })
    })
  })

  describe('resolveReview', () => {
    it('should post resolution data', async () => {
      const mockResponse = { data: { success: true, id: 'review-123' } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const resolution = { status: 'approved', notes: 'Looks good' }
      const result = await ingestionGateAPI.resolveReview('review-123', resolution)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/review-queue/review-123/resolve',
        resolution
      )
      expect(result).toEqual({ success: true, id: 'review-123' })
    })
  })

  describe('applyPatch', () => {
    it('should post patch data', async () => {
      const mockResponse = { data: { success: true, patched_fields: ['name'] } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const patchRequest = {
        finding_id: 'finding-1',
        patch: [{ op: 'replace', path: '/name', value: 'New Name' }],
      }

      const result = await ingestionGateAPI.applyPatch('review-123', patchRequest)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/review-queue/review-123/apply-patch',
        patchRequest
      )
      expect(result).toEqual({ success: true, patched_fields: ['name'] })
    })
  })

  describe('getEntitySuggest', () => {
    it('should call API with query and namespace', async () => {
      const mockItems = [
        { canonical_name: 'Sugar', match_type: 'ALIAS', score: 0.95 },
      ]
      vi.mocked(apiClient.get).mockResolvedValue(mockItems)

      const result = await ingestionGateAPI.getEntitySuggest('sug', 'ingredients')

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/entity/suggest?q=sug&namespace=ingredients')
      expect(result).toEqual(mockItems)
    })

    it('should handle wrapped response', async () => {
      const mockItems = [{ canonical_name: 'Salt', match_type: 'HYBRID', score: 0.9 }]
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockItems })

      const result = await ingestionGateAPI.getEntitySuggest('salt', 'ingredients')

      expect(result).toEqual(mockItems)
    })

    it('should encode query properly', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([])

      await ingestionGateAPI.getEntitySuggest('test value', 'allergens')

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('q=test%20value')
      )
    })
  })

  describe('commitEntityAlias', () => {
    it('should post alias data', async () => {
      const mockResponse = { data: { success: true, alias_id: 'alias-1' } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const aliasData = {
        original: 'Sugr',
        canonical: 'Sugar',
        namespace: 'ingredients',
      }

      const result = await ingestionGateAPI.commitEntityAlias(aliasData)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/entity/alias/commit', aliasData)
      expect(result).toEqual({ success: true, alias_id: 'alias-1' })
    })
  })

  describe('retryGate', () => {
    it('should post retry request', async () => {
      const mockResponse = { data: { success: true, job_id: 'job-1', status: 'queued' } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const request = { action: 'rescan', target_fields: ['name', 'ingredients'] }
      const result = await ingestionGateAPI.retryGate('scan-123', request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ingestion-gate/retry', {
        scan_id: 'scan-123',
        action: 'rescan',
        target_fields: ['name', 'ingredients'],
      })
      expect(result).toEqual({ success: true, job_id: 'job-1', status: 'queued' })
    })
  })

  describe('bulkResolve', () => {
    it('should post bulk resolve request', async () => {
      const mockResponse = { data: { success: true, resolved: 3, failed: 0 } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await ingestionGateAPI.bulkResolve(['r1', 'r2', 'r3'], 'approved')

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/review-queue/bulk/resolve', {
        review_ids: ['r1', 'r2', 'r3'],
        status: 'approved',
      })
      expect(result).toEqual({ success: true, resolved: 3, failed: 0 })
    })

    it('should handle partial failures', async () => {
      const mockResponse = {
        data: {
          success: true,
          resolved: 2,
          failed: 1,
          errors: [{ id: 'r3', error: 'Not found' }],
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await ingestionGateAPI.bulkResolve(['r1', 'r2', 'r3'], 'rejected')

      expect(result.errors).toHaveLength(1)
    })
  })

  describe('bulkApplyFix', () => {
    it('should post bulk fix request', async () => {
      const mockResponse = { data: { success: true, applied: 3, failed: 0 } }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const request = {
        rule_id: 'rule-1',
        patch: [{ op: 'replace', path: '/name', value: 'Fixed Name' }],
      }

      const result = await ingestionGateAPI.bulkApplyFix(['r1', 'r2', 'r3'], request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/review-queue/bulk/apply-fix', {
        review_ids: ['r1', 'r2', 'r3'],
        rule_id: 'rule-1',
        patch: request.patch,
      })
      expect(result).toEqual({ success: true, applied: 3, failed: 0 })
    })
  })
})
