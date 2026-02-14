import { apiClient } from '../client'
import type {
  OCRReviewStats,
  OCRReviewListResponse,
  ApproveOCRReviewRequest,
  RejectOCRReviewRequest,
  OCRReviewActionResponse,
} from '@/types/ocrReview'

export const ocrReviewAPI = {
  async getStats(): Promise<{ stats: OCRReviewStats }> {
    return apiClient.get('/api/v1/ocr-review/stats')
  },

  async getPending(params?: {
    limit?: number
    offset?: number
    min_confidence?: number
    max_confidence?: number
  }): Promise<OCRReviewListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    if (params?.offset != null) searchParams.set('offset', String(params.offset))
    if (params?.min_confidence != null) searchParams.set('min_confidence', String(params.min_confidence))
    if (params?.max_confidence != null) searchParams.set('max_confidence', String(params.max_confidence))
    const qs = searchParams.toString()
    return apiClient.get(`/api/v1/ocr-review/pending${qs ? `?${qs}` : ''}`)
  },

  async approve(reviewId: string, req: ApproveOCRReviewRequest): Promise<OCRReviewActionResponse> {
    return apiClient.post(`/api/v1/ocr-review/${reviewId}/approve`, req)
  },

  async reject(reviewId: string, req: RejectOCRReviewRequest): Promise<OCRReviewActionResponse> {
    return apiClient.post(`/api/v1/ocr-review/${reviewId}/reject`, req)
  },

  async getItem(reviewId: string): Promise<{ item: import('@/types/ocrReview').OCRReviewItem }> {
    return apiClient.get(`/api/v1/ocr-review/${reviewId}`)
  },
}
