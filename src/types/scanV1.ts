// ── Scan V1 Types ────────────────────────────────────────

export interface ScanSubmitResponse {
  job_id: string
  status: 'queued' | 'done'
  result?: ScanResult
}

export interface ScanResult {
  job_id: string
  status: string
  updated_at: string | null
  product_entity_ref: string | null
  trace_id: string | null
  facts_summary: Record<string, unknown>
  inference_summary: Record<string, unknown>
  refs: Record<string, unknown>
  knowledge_refs: unknown[]
  alerts: unknown[]
  reason_codes: unknown[]
  error_class: string | null
  error_detail_ref: string | null
}
