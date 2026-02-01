/**
 * Rules API Endpoints Tests
 *
 * @module lib/api/endpoints/rules.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rulesAPI } from './rules'
import { apiClient } from '../client'

// Mock apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('rulesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRules', () => {
    it('should call API with default params', async () => {
      const mockResponse = { rules: [], total: 0 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await rulesAPI.getRules()

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/rules?')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort_by=hit_count')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('order=desc')
      )
    })

    it('should call API with custom params', async () => {
      const mockResponse = { rules: [], total: 0 }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await rulesAPI.getRules({
        is_active: true,
        sort_by: 'created_at',
        order: 'asc',
        limit: 100,
        offset: 10,
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('is_active=true')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort_by=created_at')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('order=asc')
      )
    })
  })

  describe('getRule', () => {
    it('should call API with rule ID', async () => {
      const mockResponse = { id: 'rule-123', name: 'Test Rule' }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await rulesAPI.getRule('rule-123')

      expect(apiClient.get).toHaveBeenCalledWith('/admin/rules/rule-123')
    })
  })

  describe('createRule', () => {
    it('should post rule data', async () => {
      const mockResponse = { id: 'rule-123' }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const ruleData = {
        name: 'Test Rule',
        pattern: 'test.*',
        replacement: 'replaced',
      }

      await rulesAPI.createRule(ruleData)

      expect(apiClient.post).toHaveBeenCalledWith('/admin/rules', ruleData)
    })
  })

  describe('updateRule', () => {
    it('should put rule data', async () => {
      const mockResponse = { id: 'rule-123' }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const updateData = { name: 'Updated Rule' }

      await rulesAPI.updateRule('rule-123', updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/admin/rules/rule-123', updateData)
    })
  })

  describe('deleteRule', () => {
    it('should delete rule', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      await rulesAPI.deleteRule('rule-123')

      expect(apiClient.delete).toHaveBeenCalledWith('/admin/rules/rule-123')
    })
  })

  describe('toggleRule', () => {
    it('should toggle rule active state', async () => {
      const mockResponse = { id: 'rule-123', is_active: false }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await rulesAPI.toggleRule('rule-123')

      expect(apiClient.post).toHaveBeenCalledWith('/admin/rules/rule-123/toggle', {})
    })
  })

  describe('testRule', () => {
    it('should test rule with sample data', async () => {
      const mockResponse = { matches: 5, samples: [] }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const testData = {
        pattern: 'test.*',
        sample_text: 'test sample text',
      }

      await rulesAPI.testRule(testData)

      expect(apiClient.post).toHaveBeenCalledWith('/admin/rules/test', testData)
    })
  })
})
