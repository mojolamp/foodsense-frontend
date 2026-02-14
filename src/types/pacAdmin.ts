// ── Engine Mode ──

export type EngineModeValue = 'NORMAL' | 'SAFETY_LOCKDOWN' | 'READONLY_CACHE'

export interface EngineModeResponse {
  mode: EngineModeValue
  reason: string | null
  set_by: string | null
  source: 'env' | 'redis' | 'default'
  ttl_seconds: number | null
  expires_at: string | null
  set_at: string | null
  queried_at: string
}

export interface SetEngineModeRequest {
  mode: EngineModeValue
  reason: string
  ttl_seconds?: number
}

// ── Kill Switch ──

export type KillSwitchScope = 'global' | 'tenant'

export interface KillSwitchOverride {
  scope: KillSwitchScope
  scope_id: string | null
  mode: string
  reason: string
  set_by: string
  ttl_seconds: number
  expires_at: string
}

export interface KillSwitchStatus {
  global_override: KillSwitchOverride | null
  active_overrides: KillSwitchOverride[]
  resolved_mode: {
    mode: string
    reason: string | null
    set_by: string | null
    source: string
  }
  queried_at: string
}

export interface ActivateKillSwitchRequest {
  scope: KillSwitchScope
  scope_id?: string | null
  mode?: 'SAFETY_LOCKDOWN' | 'READONLY_CACHE'
  reason: string
  ttl_seconds?: number
}

export interface ActivateKillSwitchResponse {
  success: boolean
  override: {
    scope: string
    mode: string
    reason: string
    set_by: string
    ttl_seconds: number
  }
  message: string
  activated_at: string
}

export interface DeactivateKillSwitchRequest {
  scope: KillSwitchScope
  scope_id?: string | null
}

export interface DeactivateKillSwitchResponse {
  success: boolean
  scope: string
  scope_id: string | null
  message: string
  deactivated_at: string
}

// ── Quarantine ──

export type QuarantineSeverity = 'CRITICAL' | 'WARN' | 'INFO'
export type QuarantineReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RELEASED'

export interface QuarantineEvent {
  id: string
  severity: QuarantineSeverity
  product_id: string
  reason: string
  sla_deadline: string
  review_status: QuarantineReviewStatus
  reviewer_id: string | null
  review_note: string | null
  created_at: string
  resolved_at: string | null
}

export interface QuarantineListResponse {
  events: QuarantineEvent[]
  total: number
  limit: number
  offset: number
  queried_at: string
}

export interface QuarantineStats {
  CRITICAL: number
  WARN: number
  INFO: number
  overdue: number
  queried_at: string
}

export interface QuarantineSLAStatus {
  sla_policy: Record<string, string>
  backlog: Record<string, number>
  overdue_events: {
    id: string
    severity: string
    sla_deadline: string
    overdue_hours: number
  }[]
  overdue_count: number
  queried_at: string
}

export interface ReviewQuarantineRequest {
  review_status: 'APPROVED' | 'REJECTED'
  review_note?: string | null
}

export interface ReviewQuarantineResponse {
  success: boolean
  event_id: string
  review_status: string
  reviewer_id: string
  review_note: string | null
  reviewed_at: string
}

export interface ReleaseQuarantineResponse {
  success: boolean
  event_id: string
  status: string
  released_by: string
  released_at: string
  message: string
}

export interface BulkReviewRequest {
  event_ids: string[]
  review_status: 'APPROVED' | 'REJECTED'
  review_note?: string | null
}

export interface BulkReviewResponse {
  success: boolean
  review_status: string
  total: number
  success_count: number
  fail_count: number
  results: { event_id: string; success: boolean; error?: string }[]
  reviewed_at: string
}

// ── Strategy Lint ──

export type LintSeverity = 'ERROR' | 'WARNING' | 'INFO'

export interface LintResult {
  rule: string
  severity: LintSeverity
  message: string
  file: string
  detail: string | null
}

export interface StrategyLintResponse {
  results: LintResult[]
  error_count: number
  warning_count: number
  info_count: number
  passed: boolean
  queried_at: string
}

// ── Diagnostics / Health ──

export type PacSubsystemStatus = 'ok' | 'degraded' | 'unhealthy' | 'unavailable'
export type PacOverallStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface PacSubsystemCheck {
  subsystem: string
  status: PacSubsystemStatus
  detail: Record<string, unknown> | null
}

export interface PacDiagnosticsResponse {
  status: PacOverallStatus
  checks: PacSubsystemCheck[]
  suggested_actions: string[]
  queried_at: string
}

export interface PacHealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy'
  queried_at: string
}

// ── Version Registry ──

export interface VersionFingerprint {
  policy_hash: string
  data_hash: string
  data_version: string
  model_hash: string
  model_version: string
  pipeline_version: string
}

export interface VersionRegistryResponse {
  fingerprint: VersionFingerprint
  queried_at: string
}
