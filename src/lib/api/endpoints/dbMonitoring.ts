import { apiClient } from '../client'
import type {
  DbStats,
  SlowQueriesResponse,
  OptimizationReport,
  IndexUsageResponse,
  ConnectionPoolResponse,
  DbActionResponse,
  DbHealthResponse,
} from '@/types/dbMonitoring'

export const dbMonitoringAPI = {
  async getStats(): Promise<DbStats> {
    return apiClient.get('/db/stats')
  },

  async getSlowQueries(params?: {
    threshold_ms?: number
    limit?: number
  }): Promise<SlowQueriesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.threshold_ms != null) searchParams.set('threshold_ms', String(params.threshold_ms))
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return apiClient.get(`/db/slow-queries${qs ? `?${qs}` : ''}`)
  },

  async getOptimizationReport(): Promise<OptimizationReport> {
    return apiClient.get('/db/optimization-report')
  },

  async analyze(): Promise<DbActionResponse> {
    return apiClient.post('/db/analyze', {})
  },

  async getIndexUsage(table?: string): Promise<IndexUsageResponse> {
    const qs = table ? `?table=${encodeURIComponent(table)}` : ''
    return apiClient.get(`/db/index-usage${qs}`)
  },

  async getConnectionPool(): Promise<ConnectionPoolResponse> {
    return apiClient.get('/db/connection-pool')
  },

  async resetMonitoring(): Promise<DbActionResponse> {
    return apiClient.post('/db/reset-monitoring', {})
  },

  async getHealth(): Promise<DbHealthResponse> {
    return apiClient.get('/db/health')
  },
}
