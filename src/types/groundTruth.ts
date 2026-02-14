// ── Ground Truth Types ───────────────────────────────────

export interface GTSuggestRequest {
  ocr_file?: string | null
  ocr_data?: Record<string, unknown> | null
  source_day?: string | null
}

export interface GTSuggestion {
  product_name: string
  ingredients: string[]
  nutrition: Record<string, unknown>
  confidence: number
  source: string
}

export interface GTSuggestResponse {
  success: boolean
  total_suggestions: number
  suggestions: GTSuggestion[]
  processing_time_sec: number
}

export interface GTValidateRequest {
  gt_file?: string | null
  gt_data?: Record<string, unknown> | null
}

export interface GTValidateResponse {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  total_items: number
  valid_items: number
}

export interface GTConvertRequest {
  gt_file: string
  output_file?: string | null
}

export interface GTConvertResponse {
  success: boolean
  total_converted: number
  engine_inputs: Record<string, unknown>[]
  output_file: string | null
}

export interface GTHealthResponse {
  status: 'ok'
  service: string
  version: string
  features: string[]
}
