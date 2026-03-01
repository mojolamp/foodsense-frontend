import { apiClientV2 } from '../client'
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
    return apiClientV2.get<CrawlerListResponse>('/crawler/crawlers')
  },

  crawlProduct(data: CrawlProductRequest) {
    return apiClientV2.post<CrawlTaskResponse>('/crawler/crawl/product', data)
  },

  crawlSearch(data: CrawlSearchRequest) {
    return apiClientV2.post<CrawlTaskResponse>('/crawler/crawl/search', data)
  },

  crawlAllSites(data: CrawlAllSitesRequest) {
    return apiClientV2.post<CrawlTaskResponse>('/crawler/crawl/all-sites', data)
  },

  crawlScheduled(data: CrawlScheduledRequest) {
    return apiClientV2.post<CrawlTaskResponse>('/crawler/crawl/scheduled', data)
  },

  probe(params?: { sites?: string; keyword?: string; limit_per_site?: number; skip_crawl?: boolean; record_prometheus?: boolean }) {
    const query = new URLSearchParams()
    if (params?.sites) query.set('sites', params.sites)
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.limit_per_site) query.set('limit_per_site', String(params.limit_per_site))
    if (params?.skip_crawl) query.set('skip_crawl', 'true')
    if (params?.record_prometheus) query.set('record_prometheus', 'true')
    const qs = query.toString()
    return apiClientV2.post<CrawlTaskResponse>(`/crawler/probe${qs ? `?${qs}` : ''}`, {})
  },

  getAssessment(params?: { sites?: string; keyword?: string; limit_per_site?: number; skip_crawl?: boolean }) {
    const query = new URLSearchParams()
    if (params?.sites) query.set('sites', params.sites)
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.limit_per_site) query.set('limit_per_site', String(params.limit_per_site))
    if (params?.skip_crawl) query.set('skip_crawl', 'true')
    const qs = query.toString()
    return apiClientV2.get<CrawlAssessmentResponse>(`/crawler/assessment${qs ? `?${qs}` : ''}`)
  },

  validateQuality(data: ValidateQualityRequest) {
    return apiClientV2.post<ValidateQualityResponse>('/crawler/validate-quality', data)
  },

  getTaskStatus(taskId: string) {
    return apiClientV2.get<CrawlTaskStatusResponse>(`/crawler/task/${taskId}`)
  },
}
