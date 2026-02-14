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
    return apiClient.get('/api/v1/db/stats')
  },

  async getSlowQueries(params?: {
    threshold_ms?: number
    limit?: number
  }): Promise<SlowQueriesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.threshold_ms != null) searchParams.set('threshold_ms', String(params.threshold_ms))
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return apiClient.get(`/api/v1/db/slow-queries${qs ? `?${qs}` : ''}`)
  },

  async getOptimizationReport(): Promise<OptimizationReport> {
    return apiClient.get('/api/v1/db/optimization-report')
  },

  async analyze(): Promise<DbActionResponse> {
    return apiClient.post('/api/v1/db/analyze', {})
  },

  async getIndexUsage(table?: string): Promise<IndexUsageResponse> {
    const qs = table ? `?table=${encodeURIComponent(table)}` : ''
    return apiClient.get(`/api/v1/db/index-usage${qs}`)
  },

  async getConnectionPool(): Promise<ConnectionPoolResponse> {
    return apiClient.get('/api/v1/db/connection-pool')
  },

  async resetMonitoring(): Promise<DbActionResponse> {
    return apiClient.post('/api/v1/db/reset-monitoring', {})
  },

  async getHealth(): Promise<DbHealthResponse> {
    return apiClient.get('/api/v1/db/health')
  },
}
