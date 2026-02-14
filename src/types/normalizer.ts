// ── Normalizer Types ─────────────────────────────────────

export interface NormalizeRequest {
  source: 'ocr' | 'crawler' | 'api' | 'console'
  source_data: Record<string, unknown>
  enable_provenance?: boolean
}

export interface NormalizeResponse {
  success: boolean
  normalized_data: Record<string, unknown>
  provenance_id: string | null
}

export interface NormalizeBatchRequest {
  ocr_results: Record<string, unknown>[]
  enable_provenance?: boolean
  idempotency_key?: string | null
}

export interface NormalizeBatchResponse {
  success: boolean
  total: number
  succeeded: number
  failed: number
  normalized_results: Record<string, unknown>[]
  errors: string[]
}

export interface NormalizerVersionsResponse {
  normalizer_version: string
  entity_resolver_version: string
  semantic_enricher_version: string
  validator_version: string
  knowledge_base_versions: Record<string, string>
}

export interface NormalizerHealthResponse {
  status: 'healthy' | 'not_initialized'
  normalizer_initialized: boolean
  timestamp: string
}
