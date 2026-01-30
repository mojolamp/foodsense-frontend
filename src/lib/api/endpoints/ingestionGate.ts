import { apiClient } from '../client'

export const ingestionGateAPI = {
  async getReviewQueue(filters?: { status?: string; priority?: number; limit?: number; offset?: number; decision?: string }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', String(filters.priority))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.offset) params.append('offset', String(filters.offset))
    if (filters?.decision) params.append('decision', filters.decision)

    const response = await apiClient.get(`/api/v1/review-queue?${params.toString()}`)
    // API 可能直接返回陣列或包在 data 中
    return Array.isArray(response) ? response : response.data || response
  },

  async getReviewDetail(reviewId: string) {
    const response = await apiClient.get(`/api/v1/review-queue/${reviewId}`)
    return response.data
  },

  async resolveReview(reviewId: string, resolution: { status: string; notes?: string }) {
    const response = await apiClient.post(`/api/v1/review-queue/${reviewId}/resolve`, resolution)
    return response.data
  },

  async applyPatch(reviewId: string, patchRequest: { finding_id: string; patch: any[] }) {
    const response = await apiClient.post(`/api/v1/review-queue/${reviewId}/apply-patch`, patchRequest)
    return response.data
  },

  async getEntitySuggest(query: string, namespace: 'ingredients' | 'allergens' | 'additives') {
    const response = await apiClient.get(`/api/v1/entity/suggest?q=${encodeURIComponent(query)}&namespace=${namespace}`)
    // API 可能直接返回陣列或包在 data 中
    return Array.isArray(response) ? response : response.data || response
  },

  async commitEntityAlias(data: { original: string; canonical: string; namespace: string }) {
    const response = await apiClient.post('/api/v1/entity/alias/commit', data)
    return response.data
  },

  async retryGate(scanId: string, request: { action: string; target_fields: string[] }) {
    const response = await apiClient.post(`/api/v1/ingestion-gate/retry`, {
      scan_id: scanId,
      ...request,
    })
    return response.data
  },

  async bulkResolve(reviewIds: string[], status: string) {
    const response = await apiClient.post('/api/v1/review-queue/bulk/resolve', {
      review_ids: reviewIds,
      status,
    })
    return response.data
  },

  async bulkApplyFix(reviewIds: string[], request: { rule_id: string; patch: any[] }) {
    const response = await apiClient.post('/api/v1/review-queue/bulk/apply-fix', {
      review_ids: reviewIds,
      ...request,
    })
    return response.data
  },
}

