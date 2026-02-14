import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { crawlerRawAPI } from '@/lib/api/endpoints/crawlerRaw'
import { getErrorMessage } from '@/types/api'
import type {
  CrawlProductRequest,
  CrawlSearchRequest,
  CrawlAllSitesRequest,
  CrawlScheduledRequest,
  ValidateQualityRequest,
} from '@/types/crawlerRaw'

export function useCrawlerList() {
  return useQuery({
    queryKey: ['crawlerRaw', 'list'],
    queryFn: () => crawlerRawAPI.listCrawlers(),
  })
}

export function useCrawlProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CrawlProductRequest) => crawlerRawAPI.crawlProduct(data),
    onSuccess: (data) => {
      toast.success(`Crawl queued: ${data.task_id}`)
      qc.invalidateQueries({ queryKey: ['crawlerRaw'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useCrawlSearch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CrawlSearchRequest) => crawlerRawAPI.crawlSearch(data),
    onSuccess: (data) => {
      toast.success(`Search crawl queued: ${data.task_id}`)
      qc.invalidateQueries({ queryKey: ['crawlerRaw'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useCrawlAllSites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CrawlAllSitesRequest) => crawlerRawAPI.crawlAllSites(data),
    onSuccess: (data) => {
      toast.success(`All-sites crawl queued: ${data.task_id}`)
      qc.invalidateQueries({ queryKey: ['crawlerRaw'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useCrawlScheduled() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CrawlScheduledRequest) => crawlerRawAPI.crawlScheduled(data),
    onSuccess: (data) => {
      toast.success(`Scheduled crawl queued: ${data.task_id}`)
      qc.invalidateQueries({ queryKey: ['crawlerRaw'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useCrawlerProbe() {
  return useMutation({
    mutationFn: (params?: { sites?: string; keyword?: string; limit_per_site?: number; skip_crawl?: boolean; record_prometheus?: boolean }) =>
      crawlerRawAPI.probe(params),
    onSuccess: (data) => {
      toast.success(`Probe queued: ${data.task_id}`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useCrawlerAssessment(params?: { sites?: string; keyword?: string; limit_per_site?: number; skip_crawl?: boolean }) {
  return useQuery({
    queryKey: ['crawlerRaw', 'assessment', params],
    queryFn: () => crawlerRawAPI.getAssessment(params),
    enabled: false, // Manual trigger only
  })
}

export function useCrawlerValidateQuality() {
  return useMutation({
    mutationFn: (data: ValidateQualityRequest) => crawlerRawAPI.validateQuality(data),
    onSuccess: (data) => {
      toast.success(`Quality validated: ${(data.pass_rate * 100).toFixed(1)}% pass rate`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useCrawlerTaskStatus(taskId: string) {
  return useQuery({
    queryKey: ['crawlerRaw', 'task', taskId],
    queryFn: () => crawlerRawAPI.getTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'failed') return false
      return 5_000
    },
  })
}
