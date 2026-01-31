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

    const response = await apiClient.get<ReviewQueueItem[] | { data: ReviewQueueItem[] }>(`/api/v1/review-queue?${params.toString()}`)
    // API 可能直接返回陣列或包在 data 中
    return Array.isArray(response) ? response : (response as { data: ReviewQueueItem[] }).data || []
  },

  async getReviewDetail(reviewId: string): Promise<ReviewQueueItem> {
    const response = await apiClient.get<{ data: ReviewQueueItem }>(`/api/v1/review-queue/${reviewId}`)
    return response.data
  },

  async resolveReview(reviewId: string, resolution: { status: string; notes?: string }): Promise<ResolveReviewResponse> {
    const response = await apiClient.post<{ data: ResolveReviewResponse }>(`/api/v1/review-queue/${reviewId}/resolve`, resolution)
    return response.data
  },

  async applyPatch(reviewId: string, patchRequest: { finding_id: string; patch: JsonValue[] }): Promise<ApplyPatchResponse> {
    const response = await apiClient.post<{ data: ApplyPatchResponse }>(`/api/v1/review-queue/${reviewId}/apply-patch`, patchRequest)
    return response.data
  },

  async getEntitySuggest(query: string, namespace: 'ingredients' | 'allergens' | 'additives'): Promise<EntitySuggestItem[]> {
    const response = await apiClient.get<EntitySuggestItem[] | { data: EntitySuggestItem[] }>(`/api/v1/entity/suggest?q=${encodeURIComponent(query)}&namespace=${namespace}`)
    // API 可能直接返回陣列或包在 data 中
    return Array.isArray(response) ? response : (response as { data: EntitySuggestItem[] }).data || []
  },

  async commitEntityAlias(data: { original: string; canonical: string; namespace: string }): Promise<CommitAliasResponse> {
    const response = await apiClient.post<{ data: CommitAliasResponse }>('/api/v1/entity/alias/commit', data)
    return response.data
  },

  async retryGate(scanId: string, request: { action: string; target_fields: string[] }): Promise<RetryGateResponse> {
    const response = await apiClient.post<{ data: RetryGateResponse }>(`/api/v1/ingestion-gate/retry`, {
      scan_id: scanId,
      ...request,
    })
    return response.data
  },

  async bulkResolve(reviewIds: string[], status: string): Promise<BulkResolveResponse> {
    const response = await apiClient.post<{ data: BulkResolveResponse }>('/api/v1/review-queue/bulk/resolve', {
      review_ids: reviewIds,
      status,
    })
    return response.data
  },

  async bulkApplyFix(reviewIds: string[], request: { rule_id: string; patch: JsonValue[] }): Promise<BulkApplyFixResponse> {
    const response = await apiClient.post<{ data: BulkApplyFixResponse }>('/api/v1/review-queue/bulk/apply-fix', {
      review_ids: reviewIds,
      ...request,
    })
    return response.data
  },
}
