import { apiClient } from '../client'
import type {
  KGQueryRequest,
  KGQueryResponse,
  KGIngredientResponse,
  KGSimilarProductsResponse,
  KGBatchQueryRequest,
  KGBatchQueryResponse,
  KGAutocompleteResponse,
  KGQueryStats,
  VariantMatchRequest,
  VariantMatchResponse,
  VariantBatchMatchRequest,
  VariantBatchMatchResponse,
  VariantPendingReviewsResponse,
  ApproveVariantRequest,
  ApproveVariantResponse,
  RejectVariantRequest,
  RejectVariantResponse,
  VariantStats,
  CreateAggregationJobRequest,
  AggregationJob,
  AggregationJobListResponse,
  JobExecuteResponse,
  JobCancelResponse,
  PendingObservationsResponse,
  BatchObservationRequest,
  BatchRejectObservationRequest,
  BatchObservationResponse,
  AggregationStats,
  IngredientAggregation,
} from '@/types/knowledgeGraph'

// ── KG Query ──

export const kgQueryAPI = {
  async query(req: KGQueryRequest): Promise<KGQueryResponse> {
    return apiClient.post('/kg/query', req)
  },

  async getIngredient(name: string, minConfidence?: number): Promise<KGIngredientResponse> {
    const qs = minConfidence != null ? `?min_confidence=${minConfidence}` : ''
    return apiClient.get(`/kg/query/ingredient/${encodeURIComponent(name)}${qs}`)
  },

  async getSimilarProducts(productId: string, limit?: number): Promise<KGSimilarProductsResponse> {
    const qs = limit != null ? `?limit=${limit}` : ''
    return apiClient.get(`/kg/query/similar-products/${encodeURIComponent(productId)}${qs}`)
  },

  async batchQuery(req: KGBatchQueryRequest): Promise<KGBatchQueryResponse> {
    return apiClient.post('/kg/query/batch', req)
  },

  async autocomplete(q: string, limit?: number): Promise<KGAutocompleteResponse> {
    const params = new URLSearchParams({ q })
    if (limit != null) params.set('limit', String(limit))
    return apiClient.get(`/kg/query/autocomplete?${params.toString()}`)
  },

  async getStats(): Promise<KGQueryStats> {
    return apiClient.get('/kg/query/stats')
  },
}

// ── KG Variants ──

export const kgVariantsAPI = {
  async match(req: VariantMatchRequest): Promise<VariantMatchResponse> {
    return apiClient.post('/kg/variants/match', req)
  },

  async batchMatch(req: VariantBatchMatchRequest): Promise<VariantBatchMatchResponse> {
    return apiClient.post('/kg/variants/batch-match', req)
  },

  async getPendingReviews(params?: {
    limit?: number
    offset?: number
    priority?: number
  }): Promise<VariantPendingReviewsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    if (params?.offset != null) searchParams.set('offset', String(params.offset))
    if (params?.priority != null) searchParams.set('priority', String(params.priority))
    const qs = searchParams.toString()
    return apiClient.get(`/kg/variants/pending-reviews${qs ? `?${qs}` : ''}`)
  },

  async approveReview(reviewId: string, req: ApproveVariantRequest): Promise<ApproveVariantResponse> {
    return apiClient.post(`/kg/variants/review/${reviewId}/approve`, req)
  },

  async rejectReview(reviewId: string, req: RejectVariantRequest): Promise<RejectVariantResponse> {
    return apiClient.post(`/kg/variants/review/${reviewId}/reject`, req)
  },

  async getStats(): Promise<VariantStats> {
    return apiClient.get('/kg/variants/stats')
  },
}

// ── KG Aggregation ──

export const kgAggregationAPI = {
  async createJob(req: CreateAggregationJobRequest): Promise<AggregationJob> {
    return apiClient.post('/kg/aggregation/jobs', req)
  },

  async listJobs(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<AggregationJobListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    if (params?.offset != null) searchParams.set('offset', String(params.offset))
    const qs = searchParams.toString()
    return apiClient.get(`/kg/aggregation/jobs${qs ? `?${qs}` : ''}`)
  },

  async getJob(jobId: string): Promise<AggregationJob> {
    return apiClient.get(`/kg/aggregation/jobs/${jobId}`)
  },

  async executeJob(jobId: string): Promise<JobExecuteResponse> {
    return apiClient.post(`/kg/aggregation/jobs/${jobId}/execute`, {})
  },

  async cancelJob(jobId: string): Promise<JobCancelResponse> {
    return apiClient.post(`/kg/aggregation/jobs/${jobId}/cancel`, {})
  },

  async getPendingObservations(params?: {
    limit?: number
    offset?: number
    category?: string
    min_quality_score?: number
  }): Promise<PendingObservationsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    if (params?.offset != null) searchParams.set('offset', String(params.offset))
    if (params?.category) searchParams.set('category', params.category)
    if (params?.min_quality_score != null) searchParams.set('min_quality_score', String(params.min_quality_score))
    const qs = searchParams.toString()
    return apiClient.get(`/kg/aggregation/pending-observations${qs ? `?${qs}` : ''}`)
  },

  async batchApprove(req: BatchObservationRequest): Promise<BatchObservationResponse> {
    return apiClient.post('/kg/aggregation/approve-batch', req)
  },

  async batchReject(req: BatchRejectObservationRequest): Promise<BatchObservationResponse> {
    return apiClient.post('/kg/aggregation/reject-batch', req)
  },

  async getStats(): Promise<AggregationStats> {
    return apiClient.get('/kg/aggregation/stats')
  },

  async getIngredient(canonicalName: string, minObservations?: number): Promise<IngredientAggregation> {
    const qs = minObservations != null ? `?min_observations=${minObservations}` : ''
    return apiClient.get(`/kg/aggregation/ingredient/${encodeURIComponent(canonicalName)}${qs}`)
  },
}
