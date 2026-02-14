import { apiClient } from '../client'
import type {
  CollectResponse,
  PipelineRunResponse,
  ETLJobsResponse,
  CrosscheckResponse,
  VeganSitesResponse,
  CollectorType,
} from '@/types/etl'

export const etlAPI = {
  async getJobs(params?: {
    collector_type?: CollectorType
    status?: string
    page?: number
    page_size?: number
  }): Promise<ETLJobsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.collector_type) searchParams.set('collector_type', params.collector_type)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.page_size) searchParams.set('page_size', String(params.page_size))
    const qs = searchParams.toString()
    return apiClient.get<ETLJobsResponse>(`/api/etl/jobs${qs ? `?${qs}` : ''}`)
  },

  async getJob(jobId: string): Promise<{ success: boolean; job: import('@/types/etl').ETLJob }> {
    return apiClient.get(`/api/etl/jobs/${jobId}`)
  },

  async runPipeline(payload: {
    collector_type: CollectorType
    query: string
    limit: number
    site_key?: string
    auto_approve?: boolean
  }): Promise<PipelineRunResponse> {
    return apiClient.post<PipelineRunResponse>('/api/etl/pipeline', payload)
  },

  async collect(payload: {
    collector_type: CollectorType
    query: string
    limit: number
    site_key?: string
  }): Promise<CollectResponse> {
    return apiClient.post<CollectResponse>('/api/etl/collect', payload)
  },

  async crosscheckBarcode(payload: {
    barcode: string
    sources: string[]
  }): Promise<CrosscheckResponse> {
    return apiClient.post<CrosscheckResponse>('/api/etl/crosscheck/barcode', payload)
  },

  async getVeganSites(): Promise<VeganSitesResponse> {
    return apiClient.get<VeganSitesResponse>('/api/etl/collectors/vegan_ecommerce/sites')
  },

  async clean(jobId: string): Promise<{ success: boolean; job_id: string; status: string }> {
    return apiClient.post(`/api/etl/jobs/${jobId}/clean`, {})
  },

  async getReviews(status?: string): Promise<{ success: boolean; reviews: { id: string; job_id: string; product_name: string; status: string; data: Record<string, unknown>; created_at: string }[] }> {
    const qs = status ? `?status=${status}` : ''
    return apiClient.get(`/api/etl/reviews${qs}`)
  },

  async approveReview(reviewId: string): Promise<{ success: boolean; review_id: string }> {
    return apiClient.post(`/api/etl/reviews/${reviewId}/approve`, {})
  },

  async rejectReview(reviewId: string, reason?: string): Promise<{ success: boolean; review_id: string }> {
    return apiClient.post(`/api/etl/reviews/${reviewId}/reject`, { reason })
  },

  async getHealth(): Promise<{ status: string; workers: number; queues: Record<string, number>; timestamp: string }> {
    return apiClient.get('/api/etl/health')
  },
}
