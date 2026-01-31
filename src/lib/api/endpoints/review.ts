import { apiClient } from '../client'
import type { OCRRecord, GroundTruthCreate, GroundTruth, ReviewStats, ReviewerMetrics, TeamMetrics } from '@/types/review'

export const reviewAPI = {
  // GET /admin/review/queue
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
    return apiClient.get<OCRRecord[]>(`/admin/review/queue${queryString ? `?${queryString}` : ''}`)
  },

  // POST /admin/review/submit
  submitReview: (data: GroundTruthCreate) => {
    return apiClient.post<GroundTruth>('/admin/review/submit', data)
  },

  // GET /admin/review/stats
  getStats: () => {
    return apiClient.get<ReviewStats>('/admin/review/stats')
  },

  // GET /admin/review/history
  getHistory: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    const queryString = query.toString()
    return apiClient.get<GroundTruth[]>(`/admin/review/history${queryString ? `?${queryString}` : ''}`)
  },

  // GET /admin/review/gold-samples
  getGoldSamples: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    const queryString = query.toString()
    return apiClient.get<GroundTruth[]>(`/admin/review/gold-samples${queryString ? `?${queryString}` : ''}`)
  },

  // POST /admin/review/gold-samples
  markAsGold: (gt_id: string) => {
    return apiClient.post<{ success: boolean; message?: string }>(`/admin/review/gold-samples?gt_id=${gt_id}`, {})
  },

  // GET /admin/review/metrics/personal
  getPersonalMetrics: () => {
    return apiClient.get<ReviewerMetrics>('/admin/review/metrics/personal')
  },

  // GET /admin/review/metrics/team
  getTeamMetrics: () => {
    return apiClient.get<TeamMetrics>('/admin/review/metrics/team')
  },

  // POST /admin/review/batch-submit (P1-1)
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
    }>('/admin/review/batch-submit', data)
  },
}
