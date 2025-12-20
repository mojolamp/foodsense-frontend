import { useQuery } from '@tanstack/react-query'
import { reviewAPI } from '@/lib/api/endpoints/review'
import type { ReviewerMetrics, GroundTruth } from '@/types/review'

// 個人績效指標
export function usePersonalMetrics() {
  return useQuery({
    queryKey: ['reviewMetrics', 'personal'],
    queryFn: () => reviewAPI.getPersonalMetrics(),
    refetchInterval: 60000, // 每分鐘刷新
  })
}

// 團隊績效指標
export function useTeamMetrics() {
  return useQuery({
    queryKey: ['reviewMetrics', 'team'],
    queryFn: () => reviewAPI.getTeamMetrics(),
    refetchInterval: 300000, // 每 5 分鐘刷新
  })
}

// 從歷史記錄計算個人指標 (後端 API 未就緒時的備用方案)
export function useCalculatedPersonalMetrics() {
  const { data: history } = useQuery({
    queryKey: ['reviewHistory', 100],
    queryFn: () => reviewAPI.getHistory({ limit: 100 }),
  })

  const { data: goldSamples } = useQuery({
    queryKey: ['goldSamples', 100],
    queryFn: () => reviewAPI.getGoldSamples({ limit: 100 }),
  })

  // 計算統計數據
  const metrics: ReviewerMetrics | null = history ? calculateMetrics(history, goldSamples || []) : null

  return {
    data: metrics,
    isLoading: !history,
  }
}

function calculateMetrics(history: GroundTruth[], goldSamples: GroundTruth[]): ReviewerMetrics {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // 今日審核
  const reviewsToday = history.filter(r => new Date(r.created_at) >= today).length

  // 本週審核
  const reviewsThisWeek = history.filter(r => new Date(r.created_at) >= weekAgo).length

  // 本月審核
  const reviewsThisMonth = history.filter(r => new Date(r.created_at) >= monthAgo).length

  // 平均品質分數
  const avgQualityScore = history.length > 0
    ? history.reduce((sum, r) => sum + r.data_quality_score, 0) / history.length
    : 0

  // 平均信心分數
  const avgConfidenceScore = history.length > 0
    ? history.reduce((sum, r) => sum + r.confidence_score, 0) / history.length
    : 0

  // 品質分數分佈
  const qualityDistribution = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: history.filter(r => r.data_quality_score === i + 1).length
  }))

  // 信心分數分佈
  const confidenceDistribution = [
    { range: '0.0-0.2', count: history.filter(r => r.confidence_score < 0.2).length },
    { range: '0.2-0.4', count: history.filter(r => r.confidence_score >= 0.2 && r.confidence_score < 0.4).length },
    { range: '0.4-0.6', count: history.filter(r => r.confidence_score >= 0.4 && r.confidence_score < 0.6).length },
    { range: '0.6-0.8', count: history.filter(r => r.confidence_score >= 0.6 && r.confidence_score < 0.8).length },
    { range: '0.8-1.0', count: history.filter(r => r.confidence_score >= 0.8).length },
  ]

  return {
    total_reviewed: history.length,
    avg_review_time: 0, // 需要後端提供
    avg_quality_score: Number(avgQualityScore.toFixed(2)),
    avg_confidence_score: Number(avgConfidenceScore.toFixed(3)),
    gold_sample_count: goldSamples.length,
    reviews_today: reviewsToday,
    reviews_this_week: reviewsThisWeek,
    reviews_this_month: reviewsThisMonth,
    quality_distribution: qualityDistribution,
    confidence_distribution: confidenceDistribution,
  }
}
