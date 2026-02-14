import { apiClient } from '../client'
import type {
  CorrectionSubmitRequest,
  CorrectionSubmitResponse,
  CorrectionsListResponse,
  CorrectionActionResponse,
  FeedbackSubmitRequest,
  FeedbackSubmitResponse,
  CorrectionStatus,
} from '@/types/ocrCorrections'

export const ocrCorrectionsAPI = {
  submit(data: CorrectionSubmitRequest) {
    return apiClient.post<CorrectionSubmitResponse>('/admin/ocr/corrections/submit', data)
  },

  list(status: CorrectionStatus = 'pending') {
    return apiClient.get<CorrectionsListResponse>(`/admin/ocr/corrections?status=${status}`)
  },

  approve(pairId: string) {
    return apiClient.post<CorrectionActionResponse>(`/admin/ocr/corrections/${pairId}/approve`, {})
  },

  reject(pairId: string) {
    return apiClient.post<CorrectionActionResponse>(`/admin/ocr/corrections/${pairId}/reject`, {})
  },

  submitFeedback(data: FeedbackSubmitRequest) {
    return apiClient.post<FeedbackSubmitResponse>('/admin/ocr/feedback/submit', data)
  },
}
