// ── Crawler Raw Types ────────────────────────────────────

export interface CrawlerListResponse {
  crawlers: string[]
  total: number
}

export interface CrawlProductRequest {
  site_name: string
  url: string
}

export interface CrawlSearchRequest {
  site_name: string
  keyword: string
  limit?: number
}

export interface CrawlAllSitesRequest {
  keyword: string
  limit_per_site?: number
}

export interface CrawlScheduledRequest {
  keywords: string[]
  sites?: string[] | null
  limit_per_keyword?: number
}

export interface CrawlTaskResponse {
  task_id: string
  status: 'queued'
  message: string
}

export interface CrawlProbeParams {
  sites?: string
  keyword?: string
  limit_per_site?: number
  skip_crawl?: boolean
  record_prometheus?: boolean
}

export interface CrawlAssessmentParams {
  sites?: string
  keyword?: string
  limit_per_site?: number
  skip_crawl?: boolean
}

export interface CrawlAssessmentResponse {
  sites: {
    site: string
    success_rate: number
    avg_quality: number
    total_crawled: number
    errors: number
  }[]
  overall: {
    success_rate: number
    avg_quality: number
    total: number
  }
  timestamp: string
}

export interface ValidateQualityRequest {
  items: Record<string, unknown>[]
  sample_ratio?: number
}

export interface ValidateQualityResponse {
  total: number
  sampled: number
  pass_rate: number
  issues: {
    field: string
    issue: string
    count: number
  }[]
}

export interface CrawlTaskStatusResponse {
  task_id: string
  status: 'queued' | 'running' | 'done' | 'failed'
  result?: unknown
  error?: string
  created_at?: string
  updated_at?: string
}
