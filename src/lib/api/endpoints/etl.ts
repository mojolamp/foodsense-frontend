import { apiClientV2V2 } from '../client'
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
    return apiClientV2.get<ETLJobsResponse>(`/etl/jobs${qs ? `?${qs}` : ''}`)
  },

  async getJob(jobId: string): Promise<{ success: boolean; job: import('@/types/etl').ETLJob }> {
    return apiClientV2.get(`/etl/jobs/${jobId}`)
  },

  async runPipeline(payload: {
    collector_type: CollectorType
    query: string
    limit: number
    site_key?: string
    auto_approve?: boolean
  }): Promise<PipelineRunResponse> {
    return apiClientV2.post<PipelineRunResponse>('/etl/pipeline', payload)
  },

  async collect(payload: {
    collector_type: CollectorType
    query: string
    limit: number
    site_key?: string
  }): Promise<CollectResponse> {
    return apiClientV2.post<CollectResponse>('/etl/collect', payload)
  },

  async crosscheckBarcode(payload: {
    barcode: string
    sources: string[]
  }): Promise<CrosscheckResponse> {
    return apiClientV2.post<CrosscheckResponse>('/etl/crosscheck/barcode', payload)
  },

  async getVeganSites(): Promise<VeganSitesResponse> {
    return apiClientV2.get<VeganSitesResponse>('/etl/collectors/vegan_ecommerce/sites')
  },

  async clean(jobId: string): Promise<{ success: boolean; job_id: string; status: string }> {
    return apiClientV2.post(`/etl/jobs/${jobId}/clean`, {})
  },

  async getReviews(status?: string): Promise<{ success: boolean; reviews: { id: string; job_id: string; product_name: string; status: string; data: Record<string, unknown>; created_at: string }[] }> {
    const qs = status ? `?status=${status}` : ''
    return apiClientV2.get(`/etl/reviews${qs}`)
  },

  async approveReview(reviewId: string): Promise<{ success: boolean; review_id: string }> {
    return apiClientV2.post(`/etl/reviews/${reviewId}/approve`, {})
  },

  async rejectReview(reviewId: string, reason?: string): Promise<{ success: boolean; review_id: string }> {
    return apiClientV2.post(`/etl/reviews/${reviewId}/reject`, { reason })
  },

  async getHealth(): Promise<{ status: string; workers: number; queues: Record<string, number>; timestamp: string }> {
    return apiClientV2.get('/etl/health')
  },
}
