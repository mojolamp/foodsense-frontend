import { apiClient } from '../client'
import type { ReviewQueueItem } from '@/types/ingestionGate'
import type { JsonValue } from '@/types/api'

// API 回應類型定義
interface ResolveReviewResponse {
  success: boolean
  id?: string
  status?: string
}

interface BulkResolveResponse {
  success: boolean
  resolved?: number
  failed?: number
  errors?: Array<{ id: string; error: string }>
}

export interface EntitySuggestItem {
  id?: string
  name?: string
  canonical_name: string
  match_type: 'ALIAS' | 'HYBRID' | 'VECTOR_FALLBACK'
  score: number
  type?: string
}

interface CommitAliasResponse {
  success: boolean
  alias_id?: string
}

interface RetryGateResponse {
  success: boolean
  job_id?: string
  status?: string
}

interface ApplyPatchResponse {
  success: boolean
  patched_fields?: string[]
}

interface BulkApplyFixResponse {
  success: boolean
  applied?: number
  failed?: number
  errors?: Array<{ id: string; error: string }>
}

export const ingestionGateAPI = {
  async getReviewQueue(filters?: { status?: string; priority?: number; limit?: number; offset?: number; decision?: string }): Promise<ReviewQueueItem[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', String(filters.priority))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.offset) params.append('offset', String(filters.offset))
    if (filters?.decision) params.append('decision', filters.decision)

    const response = await apiClient.get<ReviewQueueItem[] | { data: ReviewQueueItem[] }>(`/review-queue?${params.toString()}`)
    return Array.isArray(response) ? response : (response as { data: ReviewQueueItem[] }).data || []
  },

  async getReviewDetail(reviewId: string): Promise<ReviewQueueItem> {
    return apiClient.get<ReviewQueueItem>(`/review-queue/${reviewId}`)
  },

  async resolveReview(reviewId: string, resolution: { status: string; notes?: string }): Promise<ResolveReviewResponse> {
    return apiClient.post<ResolveReviewResponse>(`/review-queue/${reviewId}/resolve`, resolution)
  },

  async applyPatch(reviewId: string, patchRequest: { finding_id: string; patch: JsonValue[] }): Promise<ApplyPatchResponse> {
    return apiClient.post<ApplyPatchResponse>(`/review-queue/${reviewId}/apply-patch`, patchRequest)
  },

  async getEntitySuggest(query: string, namespace: 'ingredients' | 'allergens' | 'additives'): Promise<EntitySuggestItem[]> {
    const response = await apiClient.get<EntitySuggestItem[] | { data: EntitySuggestItem[] }>(`/entity/suggest?q=${encodeURIComponent(query)}&namespace=${namespace}`)
    return Array.isArray(response) ? response : (response as { data: EntitySuggestItem[] }).data || []
  },

  async commitEntityAlias(data: { original: string; canonical: string; namespace: string }): Promise<CommitAliasResponse> {
    return apiClient.post<CommitAliasResponse>('/entity/alias/commit', data)
  },

  async retryGate(scanId: string, request: { action: string; target_fields: string[] }): Promise<RetryGateResponse> {
    return apiClient.post<RetryGateResponse>('/ingestion-gate/retry', {
      scan_id: scanId,
      ...request,
    })
  },

  async bulkResolve(reviewIds: string[], status: string): Promise<BulkResolveResponse> {
    return apiClient.post<BulkResolveResponse>('/review-queue/bulk/resolve', {
      review_ids: reviewIds,
      status,
    })
  },

  async bulkApplyFix(reviewIds: string[], request: { rule_id: string; patch: JsonValue[] }): Promise<BulkApplyFixResponse> {
    return apiClient.post<BulkApplyFixResponse>('/review-queue/bulk/apply-fix', {
      review_ids: reviewIds,
      ...request,
    })
  },
}
