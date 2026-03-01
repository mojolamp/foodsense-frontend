import { apiClient } from '../client'

// ── Types ──────────────────────────────────────────────────

export interface CoverageReport {
  total_products: number
  fields: Record<string, number>
  queried_at: string
}

export interface DriftReport {
  metric_name: string
  baseline_mean: number
  current_mean: number
  drift_magnitude: number
  is_significant: boolean
  period: string
}

export interface DriftResponse {
  reports: DriftReport[]
  last_computed: string | null
  queried_at: string
}

export interface FreshnessReport {
  total_products: number
  age_distribution: Record<string, number>
  avg_age_days: number
  stale_count: number
  queried_at: string
}

export interface ValidationErrorReport {
  total_errors: number
  by_type: Record<string, number>
  by_field: Record<string, number>
  recent_errors: Record<string, unknown>[]
  queried_at: string
}

export interface IngestionSummaryResponse {
  total_records: number
  by_status: Record<string, number>
  by_source_type: Record<string, number>
  today_count: number
  pass_rate: number
  queried_at: string
  source: string
}

// ── API Client ─────────────────────────────────────────────

export const dataQualityV2API = {
  getCoverage() {
    return apiClient.get<CoverageReport>('/coverage')
  },

  getDrift() {
    return apiClient.get<DriftResponse>('/drift')
  },

  getFreshness() {
    return apiClient.get<FreshnessReport>('/freshness')
  },

  getValidationErrors(limit = 50) {
    return apiClient.get<ValidationErrorReport>(`/validation-errors?limit=${limit}`)
  },

  getIngestionSummary() {
    return apiClient.get<IngestionSummaryResponse>('/ingestion-summary')
  },
}
