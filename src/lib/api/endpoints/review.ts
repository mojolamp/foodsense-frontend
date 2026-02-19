import { apiClient } from '../client'
import type { OCRRecord, GroundTruthCreate, GroundTruth, ReviewStats, ReviewerMetrics, TeamMetrics } from '@/types/review'

export const reviewAPI = {
  // GET /review-queue
  getQueue: (params?: {
    validation_status?: string
    confidence_level?: string
    limit?: number
    offset?: number
  }) => {
    const query = new URLSearchParams()
    if (params?.validation_status) query.append('validation_status', params.validation_status)
    if (params?.confidence_level) query.append('confidence_level', params.confidence_level)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    const queryString = query.toString()
    return apiClient.get<OCRRecord[]>(`/review-queue${queryString ? `?${queryString}` : ''}`)
  },

  // POST /review-queue/submit
  submitReview: (data: GroundTruthCreate) => {
    return apiClient.post<GroundTruth>('/review-queue/submit', data)
  },

  // GET /review-queue/stats
  getStats: () => {
    return apiClient.get<ReviewStats>('/review-queue/stats')
  },

  // GET /review-queue/history
  getHistory: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    const queryString = query.toString()
    return apiClient.get<GroundTruth[]>(`/review-queue/history${queryString ? `?${queryString}` : ''}`)
  },

  // GET /review-queue/gold-samples
  getGoldSamples: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    const queryString = query.toString()
    return apiClient.get<GroundTruth[]>(`/review-queue/gold-samples${queryString ? `?${queryString}` : ''}`)
  },

  // POST /review-queue/gold-samples
  markAsGold: (gt_id: string) => {
    return apiClient.post<{ success: boolean; message?: string }>(`/review-queue/gold-samples?gt_id=${gt_id}`, {})
  },

  // GET /review-queue/metrics/personal
  getPersonalMetrics: () => {
    return apiClient.get<ReviewerMetrics>('/review-queue/metrics/personal')
  },

  // GET /review-queue/metrics/team
  getTeamMetrics: () => {
    return apiClient.get<TeamMetrics>('/review-queue/metrics/team')
  },

  // POST /review-queue/batch-submit
  batchSubmitReviews: (data: {
    reviews: Array<{
      ocr_record_id: string
      product_id?: number
      corrected_payload?: Record<string, unknown>
      data_quality_score?: number
      confidence_score?: number
      review_notes?: string
      is_gold?: boolean
    }>
    template?: {
      data_quality_score?: number
      confidence_score?: number
      is_gold?: boolean
      review_notes?: string
    }
  }) => {
    return apiClient.post<{
      success: boolean
      submitted: number
      failed: number
      total: number
      results: Array<{
        ocr_record_id: string
        status: string
        gt_id?: string
      }>
      errors: Array<{
        ocr_record_id: string
        error: string
      }>
    }>('/review-queue/batch-submit', data)
  },
}
