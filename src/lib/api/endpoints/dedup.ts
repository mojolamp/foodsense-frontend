import { apiClient } from '../client'

// ── Types ──────────────────────────────────────────────────

export type DedupScope = 'global' | 'tenant' | 'user'

export interface DedupCheckRequest {
  content: Record<string, unknown>
  scope?: DedupScope
  tenant_id?: string
  user_id?: string
  window_seconds?: number
}

export interface DedupCheckResponse {
  is_duplicate: boolean
  fingerprint: string
  scope: string
  window_seconds: number
}

export interface DedupMarkSeenRequest {
  content: Record<string, unknown>
  scope?: DedupScope
  tenant_id?: string
  user_id?: string
  window_seconds?: number
  metadata?: Record<string, unknown>
}

export interface DedupMarkSeenResponse {
  success: boolean
  fingerprint: string
  window_seconds: number
  expires_at: string
}

export interface DedupCheckAndMarkResponse {
  is_duplicate: boolean
  fingerprint: string
  action: 'skipped' | 'marked_seen'
  message: string
  expires_at?: string
}

export interface DedupClearResponse {
  success: boolean
  mode: string
  cleared: number
  scope?: string
}

export interface DedupStatsResponse {
  mode: string
  total_fingerprints: number | null
  redis_available: boolean
}

export interface DedupHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  service: string
  mode?: string
  redis_available?: boolean
  error?: string
  timestamp: string
}

// ── API Client ─────────────────────────────────────────────

export const dedupAPI = {
  check(data: DedupCheckRequest) {
    return apiClient.post<DedupCheckResponse>('/dedup/check', data)
  },

  markSeen(data: DedupMarkSeenRequest) {
    return apiClient.post<DedupMarkSeenResponse>('/dedup/mark-seen', data)
  },

  checkAndMark(data: DedupCheckRequest) {
    return apiClient.post<DedupCheckAndMarkResponse>('/dedup/check-and-mark', data)
  },

  clear(scope?: DedupScope) {
    const params = new URLSearchParams()
    if (scope) params.set('scope', scope)
    const qs = params.toString()
    return apiClient.delete<DedupClearResponse>(`/dedup/clear${qs ? `?${qs}` : ''}`)
  },

  getStats() {
    return apiClient.get<DedupStatsResponse>('/dedup/stats')
  },

  getHealth() {
    return apiClient.get<DedupHealthResponse>('/dedup/health')
  },
}
