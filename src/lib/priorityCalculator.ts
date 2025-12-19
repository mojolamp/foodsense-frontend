import type { OCRRecord, PrioritySortStrategy, PriorityWeights } from '@/types/review'

// 預設權重配置
const DEFAULT_WEIGHTS: Record<PrioritySortStrategy, PriorityWeights> = {
  quick_wins: {
    urgency: 0.2,
    business: 0.4,
    quality: 0.3,
    complexity: 0.1,
  },
  urgent_first: {
    urgency: 0.6,
    business: 0.2,
    quality: 0.1,
    complexity: 0.1,
  },
  quality_impact: {
    urgency: 0.1,
    business: 0.2,
    quality: 0.6,
    complexity: 0.1,
  },
  balanced: {
    urgency: 0.3,
    business: 0.3,
    quality: 0.2,
    complexity: 0.2,
  },
}

/**
 * 計算單筆記錄的優先級分數
 */
export function calculatePriorityScore(
  record: OCRRecord,
  strategy: PrioritySortStrategy = 'balanced'
): number {
  const weights = DEFAULT_WEIGHTS[strategy]

  // 1. 緊急度分數 (等待時間)
  const urgencyScore = calculateUrgencyScore(record.created_at)

  // 2. 業務重要性分數
  const businessScore = calculateBusinessScore(record)

  // 3. 品質影響分數
  const qualityScore = calculateQualityScore(record)

  // 4. 複雜度分數 (負向，越簡單越好)
  const complexityScore = calculateComplexityScore(record)

  // 綜合計算
  const priorityScore =
    weights.urgency * urgencyScore +
    weights.business * businessScore +
    weights.quality * qualityScore -
    weights.complexity * complexityScore

  return Math.max(0, Math.min(100, priorityScore))
}

/**
 * 計算緊急度分數 (0-100)
 * 基於等待時間，越久越高
 */
function calculateUrgencyScore(createdAt: string): number {
  const now = new Date()
  const created = new Date(createdAt)
  const waitHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)

  // 0-6 小時: 0-30 分
  if (waitHours < 6) return (waitHours / 6) * 30

  // 6-24 小時: 30-60 分
  if (waitHours < 24) return 30 + ((waitHours - 6) / 18) * 30

  // 24-72 小時: 60-85 分
  if (waitHours < 72) return 60 + ((waitHours - 24) / 48) * 25

  // 72+ 小時: 85-100 分
  return Math.min(100, 85 + ((waitHours - 72) / 168) * 15)
}

/**
 * 計算業務重要性分數 (0-100)
 * 基於來源類型和驗證狀態
 */
function calculateBusinessScore(record: OCRRecord): number {
  let score = 50 // 基準分數

  // 來源類型影響
  const sourceWeight: Record<string, number> = {
    'official_website': 20,
    'retailer': 15,
    'user_upload': 10,
    'scraper': 5,
  }
  score += sourceWeight[record.source_type] || 0

  // 驗證狀態影響
  if (record.logic_validation_status === 'FAIL') {
    score += 20 // FAIL 更重要，需要修正
  } else if (record.logic_validation_status === 'WARN') {
    score += 10
  }

  return Math.min(100, score)
}

/**
 * 計算品質影響分數 (0-100)
 * 基於信心水平和驗證狀態
 */
function calculateQualityScore(record: OCRRecord): number {
  let score = 50 // 基準分數

  // 信心水平影響 (LOW 信心度更需要審核)
  const confidenceWeight: Record<string, number> = {
    'LOW': 30,
    'MEDIUM': 20,
    'HIGH': 10,
  }
  score += confidenceWeight[record.confidence_level] || 0

  // 驗證狀態影響
  if (record.logic_validation_status === 'FAIL') {
    score += 20
  } else if (record.logic_validation_status === 'WARN') {
    score += 15
  } else if (record.logic_validation_status === 'PASS') {
    score += 5 // PASS 仍需審核，但優先級較低
  }

  return Math.min(100, score)
}

/**
 * 計算複雜度分數 (0-100)
 * 基於 OCR 文字長度和結構複雜度
 */
function calculateComplexityScore(record: OCRRecord): number {
  if (!record.ocr_raw_text) return 30 // 沒有文字，中等複雜度

  const textLength = record.ocr_raw_text.length

  // 文字長度影響
  let score = 0
  if (textLength < 100) {
    score = 20 // 簡單
  } else if (textLength < 500) {
    score = 40 // 中等
  } else if (textLength < 1000) {
    score = 60 // 複雜
  } else {
    score = 80 // 非常複雜
  }

  return score
}

/**
 * 對記錄列表進行優先級排序
 */
export function sortByPriority(
  records: OCRRecord[],
  strategy: PrioritySortStrategy = 'balanced'
): OCRRecord[] {
  return records
    .map(record => ({
      ...record,
      priority_score: calculatePriorityScore(record, strategy),
    }))
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
}

/**
 * 獲取推薦審核清單
 * 返回前 N 筆最高優先級的記錄
 */
export function getRecommendedReviews(
  records: OCRRecord[],
  limit: number = 10,
  strategy: PrioritySortStrategy = 'balanced'
): OCRRecord[] {
  const sorted = sortByPriority(records, strategy)
  return sorted.slice(0, limit)
}

/**
 * 獲取優先級顏色
 */
export function getPriorityColor(score: number): string {
  if (score >= 80) return 'text-red-600 bg-red-50'
  if (score >= 60) return 'text-orange-600 bg-orange-50'
  if (score >= 40) return 'text-yellow-600 bg-yellow-50'
  if (score >= 20) return 'text-blue-600 bg-blue-50'
  return 'text-gray-600 bg-gray-50'
}

/**
 * 獲取優先級標籤
 */
export function getPriorityLabel(score: number): string {
  if (score >= 80) return '緊急'
  if (score >= 60) return '高'
  if (score >= 40) return '中'
  if (score >= 20) return '低'
  return '極低'
}
