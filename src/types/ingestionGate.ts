export interface ReviewQueueItem {
  id: string
  tenant_id: string
  scan_id: string
  gate_run_id: string
  priority: number
  reason_codes: string[]
  ui_payload: {
    gate_decision: 'PASS' | 'WARN_ALLOW' | 'BLOCK'
    priority: number
    reason_codes: string[]
    counts: {
      block_findings: number
      warn_findings: number
      no_evidence_fields: number
      ambiguous_fields: number
      one_click_fix_count: number
    }
    field_quality: {
      missing_required_fields: string[]
      low_confidence_fields: string[]
      no_evidence_fields: string[]
    }
    field_states?: FieldState[]
    findings: Finding[]
    one_click_fix_count: number
    missing_evidence_count: number
  }
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED'
  assignee?: string
  created_at: string
  updated_at: string
}

export interface FieldState {
  path: string
  label: string
  status: 'EXACT' | 'AMBIGUOUS' | 'NOT_FOUND'
  confidence: number
  source_type: 'OCR_SPAN' | 'IMAGE_ROI' | 'MANUAL'
  evidence: Evidence[]
}

export interface Finding {
  rule_id: string
  rule_version: string
  severity: 'BLOCK' | 'WARN' | 'INFO'
  field_paths: string[]
  message: string
  evidence_refs: any[]
  suggested_patch: any[]
  actionability: 'ONE_CLICK_FIX' | 'NEED_RESCAN' | 'NEED_REVIEW' | 'NONE'
}

export interface Evidence {
  evidence_id: string
  source_type: 'OCR_SPAN' | 'IMAGE_ROI' | 'MANUAL'
  image_ref: string
  page: number
  bbox: [number, number, number, number]
  span_id?: string
  text: string
  char_range?: [number, number]
  ocr_confidence?: number
  preprocess_profile?: string
  created_at: string
}

