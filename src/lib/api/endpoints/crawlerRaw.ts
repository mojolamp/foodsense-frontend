import { apiClient } from '../client'
import type {
  CrawlerListResponse,
  CrawlProductRequest,
  CrawlSearchRequest,
  CrawlAllSitesRequest,
  CrawlScheduledRequest,
  CrawlTaskResponse,
  CrawlAssessmentResponse,
  ValidateQualityRequest,
  ValidateQualityResponse,
  CrawlTaskStatusResponse,
} from '@/types/crawlerRaw'

export const crawlerRawAPI = {
  listCrawlers() {
    return apiClient.get<CrawlerListResponse>('/api/crawler/crawlers')
  },

  crawlProduct(data: CrawlProductRequest) {
    return apiClient.post<CrawlTaskResponse>('/api/crawler/crawl/product', data)
  },

  crawlSearch(data: CrawlSearchRequest) {
    return apiClient.post<CrawlTaskResponse>('/api/crawler/crawl/search', data)
  },

  crawlAllSites(data: CrawlAllSitesRequest) {
    return apiClient.post<CrawlTaskResponse>('/api/crawler/crawl/all-sites', data)
  },

  crawlScheduled(data: CrawlScheduledRequest) {
    return apiClient.post<CrawlTaskResponse>('/api/crawler/crawl/scheduled', data)
  },

  probe(params?: { sites?: string; keyword?: string; limit_per_site?: number; skip_crawl?: boolean; record_prometheus?: boolean }) {
    const query = new URLSearchParams()
    if (params?.sites) query.set('sites', params.sites)
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.limit_per_site) query.set('limit_per_site', String(params.limit_per_site))
    if (params?.skip_crawl) query.set('skip_crawl', 'true')
    if (params?.record_prometheus) query.set('record_prometheus', 'true')
    const qs = query.toString()
    return apiClient.post<CrawlTaskResponse>(`/api/crawler/probe${qs ? `?${qs}` : ''}`, {})
  },

  getAssessment(params?: { sites?: string; keyword?: string; limit_per_site?: number; skip_crawl?: boolean }) {
    const query = new URLSearchParams()
    if (params?.sites) query.set('sites', params.sites)
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.limit_per_site) query.set('limit_per_site', String(params.limit_per_site))
    if (params?.skip_crawl) query.set('skip_crawl', 'true')
    const qs = query.toString()
    return apiClient.get<CrawlAssessmentResponse>(`/api/crawler/assessment${qs ? `?${qs}` : ''}`)
  },

  validateQuality(data: ValidateQualityRequest) {
    return apiClient.post<ValidateQualityResponse>('/api/crawler/validate-quality', data)
  },

  getTaskStatus(taskId: string) {
    return apiClient.get<CrawlTaskStatusResponse>(`/api/crawler/task/${taskId}`)
  },
}
