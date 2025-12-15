export interface OCRRecord {
  id: string
  product_id: number
  source_type: string
  confidence_level: string
  logic_validation_status: string
  needs_human_review: boolean
  review_status: string
  ocr_raw_text?: string
  created_at: string
}

export interface GroundTruthCreate {
  ocr_record_id: string
  product_id: number
  corrected_payload: any
  data_quality_score: number
  confidence_score: number
  review_notes?: string
  is_gold: boolean
}

export interface GroundTruth {
  gt_id: string
  ocr_record_id: string
  product_id: number
  data_quality_score: number
  confidence_score: number
  review_notes?: string
  is_gold: boolean
  created_at: string
  updated_at: string
}

export interface ReviewStats {
  queue_stats: QueueStat[]
}

export interface QueueStat {
  logic_validation_status: string
  confidence_level: string
  pending_count: number
  avg_wait_hours?: number
}
