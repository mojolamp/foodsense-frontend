export interface CollectResponse {
  success: boolean
  job_id: string
  collector_type: string
  query: string
  limit: number
  status: 'queued' | 'running' | 'done' | 'failed'
  message: string
}

export interface PipelineRunResponse {
  success: boolean
  job_id: string
  status: string
  stages_completed: string[]
  message: string
}

export interface ETLJob {
  id: string
  collector_type: string
  source: string
  query?: string
  limit?: number
  stage: 'collect' | 'clean' | 'normalize' | 'review' | 'done'
  status: 'queued' | 'running' | 'done' | 'failed'
  records_collected: number
  records_cleaned: number
  records_in_review: number
  errors: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface ETLJobsResponse {
  success: boolean
  jobs: ETLJob[]
  total: number
}

export interface CrosscheckResult {
  barcode: string
  sources: {
    source: string
    found: boolean
    product_name?: string
    brand?: string
    ingredients?: string
    vegan_type?: string
  }[]
  conflicts: {
    field: string
    values: Record<string, string>
    suggestion: string
  }[]
}

export interface CrosscheckResponse {
  success: boolean
  result: CrosscheckResult
}

export interface VeganSite {
  key: string
  name: string
  base_url: string
  active: boolean
  last_crawl?: string
}

export interface VeganSitesResponse {
  success: boolean
  sites: VeganSite[]
}

export type CollectorType = 'openfoodfacts' | 'vegan_ecommerce'
