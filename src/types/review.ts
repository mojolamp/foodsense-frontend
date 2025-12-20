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
  priority_score?: number  // 優先級分數 (計算得出)
}

// 優先級排序策略
export type PrioritySortStrategy =
  | 'quick_wins'      // 簡單高價值優先
  | 'urgent_first'    // 等待時間優先
  | 'quality_impact'  // 品質影響優先
  | 'balanced'        // 綜合平衡

// 優先級計算權重
export interface PriorityWeights {
  urgency: number      // 等待時間權重
  business: number     // 業務重要性權重
  quality: number      // 資料品質權重
  complexity: number   // 複雜度權重 (負向)
}

// 修正後的 payload 資料結構
export interface CorrectedPayload {
  verified: boolean
  verified_at: string
  ocr_raw_text?: string
  corrections?: Record<string, string | number | boolean>
}

export interface GroundTruthCreate {
  ocr_record_id: string
  product_id: number
  corrected_payload: CorrectedPayload
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

// 審核者績效指標
export interface ReviewerMetrics {
  total_reviewed: number
  avg_review_time: number        // 秒
  avg_quality_score: number       // 1-10
  avg_confidence_score: number    // 0-1
  gold_sample_count: number
  reviews_today: number
  reviews_this_week: number
  reviews_this_month: number
  quality_distribution: { score: number; count: number }[]
  confidence_distribution: { range: string; count: number }[]
}

// 團隊績效總覽
export interface TeamMetrics {
  total_reviews: number
  avg_quality_score: number
  avg_confidence_score: number
  gold_samples_count: number
  active_reviewers: number
  top_reviewers: {
    reviewer_id: string
    reviewer_name: string
    review_count: number
    avg_quality_score: number
  }[]
}

// 時序資料
export interface TimeSeriesData {
  date: string
  value: number
}
