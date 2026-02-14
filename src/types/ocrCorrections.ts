// ── OCR Corrections Types ────────────────────────────────

export interface CorrectionPair {
  id: string
  wrong_text: string
  correct_text: string
  occurrences: number
  status: 'candidate' | 'pending' | 'approved' | 'rejected'
  created_at?: string
  updated_at?: string
}

export interface CorrectionSubmitRequest {
  wrong_text: string
  correct_text: string
  source?: string
}

export interface CorrectionSubmitResponse {
  id: string
  wrong_text: string
  correct_text: string
  occurrences: number
  status: string
}

export interface CorrectionsListResponse {
  items: CorrectionPair[]
}

export interface CorrectionActionResponse {
  success: boolean
  pair_id: string
  rule_id?: string | null
}

export interface FeedbackSubmitRequest {
  scan_id?: string | null
  ocr_output: string
  human_verified: string
  error_type?: string
  product_category?: string | null
}

export interface FeedbackSubmitResponse {
  success: boolean
  feedback_id: string | null
  extracted_pairs: CorrectionPair[]
  promoted_pending_count: number
}

export type CorrectionStatus = 'candidate' | 'pending' | 'approved' | 'rejected'
