/**
 * LawCore API Client
 *
 * Scope Lock v1.0: PRESENCE GATE ONLY
 * This module is restricted to presence checking (HAS_RULE/NO_RULE/UNKNOWN).
 * Field-level regulation details are NOT in scope for v1.0.
 *
 * Contract: 2025-12-22
 */

import { apiClientLawCore } from './client'

/**
 * LawCore v1.0 Presence Result
 * ONLY these three values are allowed
 */
export type PresenceResult = 'HAS_RULE' | 'NO_RULE' | 'UNKNOWN'

/**
 * Authority level for regulations
 */
export type AuthorityLevel = 'NATIONAL' | 'LOCAL' | 'INDUSTRY_STANDARD'

/**
 * Rule status
 */
export type RuleStatus = 'ACTIVE' | 'DEPRECATED' | 'DRAFT'

/**
 * Presence check response
 */
export interface PresenceCheckResponse {
  additive_name: string
  result: PresenceResult
  authority_level?: AuthorityLevel
  citation?: {
    doc_id?: string
    rule_id?: string
    rule_name?: string
  }
  matched_name_zh?: string
  e_number?: string
  query_timestamp: string
  runtime_version?: string
}

/**
 * LawCore Rule (Active rules only)
 */
export interface LawCoreRule {
  rule_id: string
  additive_name_zh: string
  additive_name_en?: string
  e_number?: string
  authority_level: AuthorityLevel
  citation_source: string
  effective_from?: string
  effective_until?: string
  status: RuleStatus
  raw_reg_id?: string
  created_at: string
  updated_at: string
}

/**
 * Rules list response
 */
export interface RulesListResponse {
  rules: LawCoreRule[]
  total: number
  limit: number
  offset: number
}

/**
 * Rules stats
 */
export interface RulesStats {
  active_rules_count: number
  total_rules_count: number
  by_authority: Record<AuthorityLevel, number>
  last_updated: string
}

/**
 * Raw Law document
 */
export interface RawLaw {
  raw_reg_id: string
  title: string
  official_id: string
  category: string
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  created_at: string
}

/**
 * Pending raw laws response
 */
export interface PendingRawLawsResponse {
  pending_laws: RawLaw[]
  count: number
}

/**
 * Verify raw law payload
 */
export interface VerifyRawLawPayload {
  raw_reg_id: string
  verified: boolean
  notes?: string
}

/**
 * Promote rule payload
 */
export interface PromoteRulePayload {
  raw_reg_id: string
  additives: Array<{
    name_zh: string
    name_en?: string
    e_number?: string
  }>
  authority_level: AuthorityLevel
  effective_from?: string
}

/**
 * Import raw laws payload
 */
export interface ImportRawLawsPayload {
  source: 'TFDA' | 'EFSA' | 'JECFA' | 'MANUAL'
  laws: Array<{
    title: string
    official_id?: string
    category: 'ACT' | 'REGULATION' | 'ANNOUNCEMENT' | 'GUIDELINE'
    issuing_agency?: string
    publication_date?: string
    effective_date?: string
    content_text?: string
  }>
}

/**
 * Import raw laws response
 */
export interface ImportRawLawsResponse {
  status: string
  imported: number
  skipped: number
  message: string
}

/**
 * LawCore API Client
 */
export class LawCoreAPI {
  /**
   * Check presence for a single additive (exact match only)
   */
  async checkPresence(additiveName: string): Promise<PresenceCheckResponse> {
    return apiClientLawCore.post<PresenceCheckResponse, { additive_name: string }>(
      '/check-presence',
      { additive_name: additiveName.trim() }
    )
  }

  /**
   * Get presence check result by name (GET alternative)
   */
  async getPresenceByName(name: string): Promise<PresenceCheckResponse> {
    return apiClientLawCore.get<PresenceCheckResponse>(
      `/check-presence/${encodeURIComponent(name.trim())}`
    )
  }

  /**
   * Get list of active rules
   */
  async getRules(params?: { limit?: number; offset?: number }): Promise<RulesListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.offset) queryParams.set('offset', params.offset.toString())

    const endpoint = `/rules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClientLawCore.get<RulesListResponse>(endpoint)
  }

  /**
   * Get rules statistics
   */
  async getRulesStats(): Promise<RulesStats> {
    return apiClientLawCore.get<RulesStats>('/rules/stats')
  }

  /**
   * Get pending raw laws (admin only)
   */
  async getPendingRawLaws(): Promise<PendingRawLawsResponse> {
    return apiClientLawCore.get<PendingRawLawsResponse>('/admin/pending-raw-laws')
  }

  /**
   * Verify a raw law document (admin only)
   */
  async verifyRawLaw(payload: VerifyRawLawPayload): Promise<{ message: string }> {
    return apiClientLawCore.post<{ message: string }, VerifyRawLawPayload>(
      '/admin/verify-raw-law',
      payload
    )
  }

  /**
   * Promote rules from raw law to rule layer (admin only)
   */
  async promoteRule(payload: PromoteRulePayload): Promise<{ message: string; rule_ids: string[] }> {
    return apiClientLawCore.post<{ message: string; rule_ids: string[] }, PromoteRulePayload>(
      '/admin/promote-rule',
      payload
    )
  }

  /**
   * Import raw laws to staging table (admin only)
   */
  async importRawLaws(payload: ImportRawLawsPayload): Promise<ImportRawLawsResponse> {
    return apiClientLawCore.post<ImportRawLawsResponse, ImportRawLawsPayload>(
      '/admin/import-raw-laws',
      payload
    )
  }
}

export const lawCoreAPI = new LawCoreAPI()
