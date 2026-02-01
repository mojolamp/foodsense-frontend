/**
 * LawCore API Tests
 *
 * @module lib/api/lawcore.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LawCoreAPI, lawCoreAPI } from './lawcore'
import { apiClientLawCore } from './client'

// Mock apiClientLawCore
vi.mock('./client', () => ({
  apiClientLawCore: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('LawCoreAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkPresence', () => {
    it('should post additive name for presence check', async () => {
      const mockResponse = {
        additive_name: 'MSG',
        result: 'HAS_RULE' as const,
        authority_level: 'NATIONAL' as const,
        citation: {
          doc_id: 'doc-001',
          rule_id: 'rule-001',
          rule_name: 'MSG Regulation',
        },
        matched_name_zh: '味精',
        e_number: 'E621',
        query_timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const result = await lawCoreAPI.checkPresence('MSG')

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/check-presence', { additive_name: 'MSG' })
      expect(result).toEqual(mockResponse)
    })

    it('should trim whitespace from additive name', async () => {
      const mockResponse = {
        additive_name: 'Sugar',
        result: 'NO_RULE' as const,
        query_timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      await lawCoreAPI.checkPresence('  Sugar  ')

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/check-presence', {
        additive_name: 'Sugar',
      })
    })

    it('should handle UNKNOWN result', async () => {
      const mockResponse = {
        additive_name: 'Unknown Additive',
        result: 'UNKNOWN' as const,
        query_timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const result = await lawCoreAPI.checkPresence('Unknown Additive')

      expect(result.result).toBe('UNKNOWN')
    })
  })

  describe('getPresenceByName', () => {
    it('should get presence check by name with URL encoding', async () => {
      const mockResponse = {
        additive_name: 'Citric Acid',
        result: 'HAS_RULE' as const,
        query_timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      const result = await lawCoreAPI.getPresenceByName('Citric Acid')

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/check-presence/Citric%20Acid')
      expect(result).toEqual(mockResponse)
    })

    it('should trim whitespace from name', async () => {
      const mockResponse = {
        additive_name: 'Salt',
        result: 'NO_RULE' as const,
        query_timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      await lawCoreAPI.getPresenceByName('  Salt  ')

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/check-presence/Salt')
    })

    it('should handle special characters in name', async () => {
      const mockResponse = {
        additive_name: 'E621 (MSG)',
        result: 'HAS_RULE' as const,
        query_timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      await lawCoreAPI.getPresenceByName('E621 (MSG)')

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/check-presence/E621%20(MSG)')
    })
  })

  describe('getRules', () => {
    it('should get rules without params', async () => {
      const mockResponse = {
        rules: [
          {
            rule_id: 'rule-001',
            additive_name_zh: '味精',
            authority_level: 'NATIONAL' as const,
            citation_source: '食品添加劑標準',
            status: 'ACTIVE' as const,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      const result = await lawCoreAPI.getRules()

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/rules')
      expect(result).toEqual(mockResponse)
    })

    it('should get rules with limit param', async () => {
      const mockResponse = {
        rules: [],
        total: 0,
        limit: 10,
        offset: 0,
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      await lawCoreAPI.getRules({ limit: 10 })

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/rules?limit=10')
    })

    it('should get rules with offset param', async () => {
      const mockResponse = {
        rules: [],
        total: 100,
        limit: 50,
        offset: 50,
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      await lawCoreAPI.getRules({ offset: 50 })

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/rules?offset=50')
    })

    it('should get rules with both limit and offset', async () => {
      const mockResponse = {
        rules: [],
        total: 100,
        limit: 20,
        offset: 40,
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      await lawCoreAPI.getRules({ limit: 20, offset: 40 })

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/rules?limit=20&offset=40')
    })
  })

  describe('getRulesStats', () => {
    it('should get rules statistics', async () => {
      const mockResponse = {
        active_rules_count: 150,
        total_rules_count: 200,
        by_authority: {
          NATIONAL: 100,
          LOCAL: 30,
          INDUSTRY_STANDARD: 20,
        },
        last_updated: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      const result = await lawCoreAPI.getRulesStats()

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/rules/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getPendingRawLaws', () => {
    it('should get pending raw laws', async () => {
      const mockResponse = {
        pending_laws: [
          {
            raw_reg_id: 'raw-001',
            title: 'New Food Safety Regulation',
            official_id: 'FSR-2024-001',
            category: 'food_safety',
            verification_status: 'PENDING' as const,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        count: 1,
      }
      vi.mocked(apiClientLawCore.get).mockResolvedValue(mockResponse)

      const result = await lawCoreAPI.getPendingRawLaws()

      expect(apiClientLawCore.get).toHaveBeenCalledWith('/admin/pending-raw-laws')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('verifyRawLaw', () => {
    it('should verify raw law as approved', async () => {
      const mockResponse = { message: 'Raw law verified successfully' }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const payload = {
        raw_reg_id: 'raw-001',
        verified: true,
        notes: 'Verified by admin',
      }
      const result = await lawCoreAPI.verifyRawLaw(payload)

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/admin/verify-raw-law', payload)
      expect(result).toEqual(mockResponse)
    })

    it('should verify raw law as rejected', async () => {
      const mockResponse = { message: 'Raw law rejected' }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const payload = {
        raw_reg_id: 'raw-002',
        verified: false,
        notes: 'Invalid document format',
      }
      const result = await lawCoreAPI.verifyRawLaw(payload)

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/admin/verify-raw-law', payload)
      expect(result).toEqual(mockResponse)
    })

    it('should verify raw law without notes', async () => {
      const mockResponse = { message: 'Raw law verified' }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const payload = {
        raw_reg_id: 'raw-003',
        verified: true,
      }
      await lawCoreAPI.verifyRawLaw(payload)

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/admin/verify-raw-law', payload)
    })
  })

  describe('promoteRule', () => {
    it('should promote rule from raw law', async () => {
      const mockResponse = {
        message: 'Rules promoted successfully',
        rule_ids: ['rule-001', 'rule-002'],
      }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const payload = {
        raw_reg_id: 'raw-001',
        additives: [
          { name_zh: '味精', name_en: 'MSG', e_number: 'E621' },
          { name_zh: '檸檬酸', name_en: 'Citric Acid' },
        ],
        authority_level: 'NATIONAL' as const,
        effective_from: '2024-06-01',
      }
      const result = await lawCoreAPI.promoteRule(payload)

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/admin/promote-rule', payload)
      expect(result).toEqual(mockResponse)
      expect(result.rule_ids).toHaveLength(2)
    })

    it('should promote rule without effective_from', async () => {
      const mockResponse = {
        message: 'Rule promoted',
        rule_ids: ['rule-003'],
      }
      vi.mocked(apiClientLawCore.post).mockResolvedValue(mockResponse)

      const payload = {
        raw_reg_id: 'raw-002',
        additives: [{ name_zh: '鹽' }],
        authority_level: 'LOCAL' as const,
      }
      await lawCoreAPI.promoteRule(payload)

      expect(apiClientLawCore.post).toHaveBeenCalledWith('/admin/promote-rule', payload)
    })
  })
})

describe('lawCoreAPI singleton', () => {
  it('should be an instance of LawCoreAPI', () => {
    expect(lawCoreAPI).toBeInstanceOf(LawCoreAPI)
  })
})
