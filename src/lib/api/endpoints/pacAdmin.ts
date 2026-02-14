import { apiClient } from '../client'
import type {
  EngineModeResponse,
  SetEngineModeRequest,
  KillSwitchStatus,
  ActivateKillSwitchRequest,
  ActivateKillSwitchResponse,
  DeactivateKillSwitchRequest,
  DeactivateKillSwitchResponse,
  QuarantineListResponse,
  QuarantineStats,
  QuarantineSLAStatus,
  ReviewQuarantineRequest,
  ReviewQuarantineResponse,
  ReleaseQuarantineResponse,
  BulkReviewRequest,
  BulkReviewResponse,
  StrategyLintResponse,
  VersionRegistryResponse,
  PacDiagnosticsResponse,
  PacHealthResponse,
} from '@/types/pacAdmin'

export const pacAdminAPI = {
  // ── Engine Mode ──

  async getEngineMode(): Promise<EngineModeResponse> {
    return apiClient.get('/api/v1/admin/pac/engine-mode')
  },

  async setEngineMode(req: SetEngineModeRequest): Promise<EngineModeResponse> {
    return apiClient.post('/api/v1/admin/pac/engine-mode', req)
  },

  // ── Kill Switch ──

  async getKillSwitch(tenantId?: string): Promise<KillSwitchStatus> {
    const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : ''
    return apiClient.get(`/api/v1/admin/pac/kill-switch${qs}`)
  },

  async activateKillSwitch(req: ActivateKillSwitchRequest): Promise<ActivateKillSwitchResponse> {
    return apiClient.post('/api/v1/admin/pac/kill-switch/activate', req)
  },

  async deactivateKillSwitch(req: DeactivateKillSwitchRequest): Promise<DeactivateKillSwitchResponse> {
    return apiClient.post('/api/v1/admin/pac/kill-switch/deactivate', req)
  },

  // ── Quarantine ──

  async getQuarantineEvents(params?: {
    severity?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<QuarantineListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.severity) searchParams.set('severity', params.severity)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    const qs = searchParams.toString()
    return apiClient.get(`/api/v1/admin/pac/quarantine${qs ? `?${qs}` : ''}`)
  },

  async getQuarantineStats(): Promise<QuarantineStats> {
    return apiClient.get('/api/v1/admin/pac/quarantine/stats')
  },

  async getQuarantineSLA(): Promise<QuarantineSLAStatus> {
    return apiClient.get('/api/v1/admin/pac/quarantine/sla-status')
  },

  async reviewQuarantine(eventId: string, req: ReviewQuarantineRequest): Promise<ReviewQuarantineResponse> {
    return apiClient.post(`/api/v1/admin/pac/quarantine/${eventId}/review`, req)
  },

  async releaseQuarantine(eventId: string): Promise<ReleaseQuarantineResponse> {
    return apiClient.post(`/api/v1/admin/pac/quarantine/${eventId}/release`, { confirm: true })
  },

  async bulkReviewQuarantine(req: BulkReviewRequest): Promise<BulkReviewResponse> {
    return apiClient.post('/api/v1/admin/pac/quarantine/bulk-review', req)
  },

  // ── Strategy Lint ──

  async getStrategyLint(): Promise<StrategyLintResponse> {
    return apiClient.get('/api/v1/admin/pac/strategy-lint')
  },

  // ── Version Registry ──

  async getVersionRegistry(): Promise<VersionRegistryResponse> {
    return apiClient.get('/api/v1/admin/pac/version-registry')
  },

  // ── Diagnostics / Health ──

  async getDiagnostics(): Promise<PacDiagnosticsResponse> {
    return apiClient.get('/api/v1/admin/pac/diagnostics')
  },

  async getHealth(): Promise<PacHealthResponse> {
    return apiClient.get('/api/v1/admin/pac/health')
  },
}
