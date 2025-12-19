export interface ReviewTemplate {
  id: string
  name: string
  description?: string
  data_quality_score: number
  confidence_score: number
  is_gold: boolean
  default_notes?: string
  icon?: string
  color?: string
}

export interface BatchReviewSubmit {
  records: Array<{
    ocr_record_id: string
    product_id: number
  }>
  template: {
    data_quality_score: number
    confidence_score: number
    is_gold: boolean
    review_notes?: string
  }
}

export interface BatchReviewProgress {
  total: number
  completed: number
  failed: number
  current?: string
}

// 預設評分模板
export const DEFAULT_TEMPLATES: ReviewTemplate[] = [
  {
    id: 'excellent',
    name: '優質樣本',
    description: '高品質、高信心度，適合標記為黃金樣本',
    data_quality_score: 9,
    confidence_score: 0.95,
    is_gold: true,
    icon: '⭐',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'good',
    name: '良好品質',
    description: '品質良好，信心度高',
    data_quality_score: 8,
    confidence_score: 0.85,
    is_gold: false,
    icon: '✓',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'acceptable',
    name: '可接受',
    description: '品質尚可，需要注意',
    data_quality_score: 7,
    confidence_score: 0.75,
    is_gold: false,
    icon: '○',
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
  },
  {
    id: 'needs-improvement',
    name: '需改進',
    description: '品質較差，建議複查',
    data_quality_score: 5,
    confidence_score: 0.6,
    is_gold: false,
    icon: '△',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  },
  {
    id: 'poor',
    name: '低品質',
    description: '品質不佳，需要重新處理',
    data_quality_score: 3,
    confidence_score: 0.4,
    is_gold: false,
    icon: '✕',
    color: 'bg-red-50 border-red-200 hover:bg-red-100'
  }
]
