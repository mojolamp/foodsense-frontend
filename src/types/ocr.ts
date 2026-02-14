export interface OCRResponse {
  success: boolean
  image: string
  timestamp: string
  mode: string
  result: Record<string, unknown>
  elapsed_sec: number
  cost_usd: number
  tokens?: Record<string, number>
}

export interface OCRSmartNormalizeResponse {
  success: boolean
  route: string
  route_reasons: string[]
  image_id: string
  attempts: Record<string, unknown>
  normalized: Record<string, unknown>
}

export interface OCRV2Response {
  success: boolean
  request_id: string
  image_id: string
  ocr_method: string
  overall_confidence: number
  confidence_level: string
  ocr_raw_text: string
  parsed_regions: Record<string, unknown>
  corrected_text: Record<string, unknown>
  image_quality: Record<string, unknown>
  quality_flags: string[]
  needs_human_review: boolean
  suggested_actions: string[]
  processing_time_ms: number
  processed_at: string
}

export interface IngestionRunResponse {
  success: boolean
  record_id: string
  trace_id: string
  status: 'pending' | 'dlq' | 'processing'
  message: string
}

export interface IngestionStatusResponse {
  id: string
  schema_version: string
  source_type: string
  source_id: string
  external_id?: string
  canonical_url?: string
  payload_schema_version: string
  raw_payload: Record<string, unknown>
  requested_at: string
  trace_id: string
  dedup_key: string
  retry_count: number
  max_retries: number
  error_class?: string
  last_error?: string
  status: string
  dlq_reason?: string
  created_at: string
  updated_at: string
  normalized_result?: Record<string, unknown>
}

export type OCREngine = 'paddle' | 'gpt4o' | 'conditional'
