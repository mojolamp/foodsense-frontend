/**
 * Monitoring API Client
 *
 * Three-layer defense monitoring system
 * - L1: Business Health (composed from /stats + /dashboard-data)
 * - L2: Application Performance (composed from /stats + /dashboard-data)
 * - L3: Infrastructure (composed from /stats + /dashboard-data)
 *
 * Backend endpoints are at /api/v1/monitoring/* (Tier 2 = admin JWT mandatory)
 */

import { apiClient } from './client'

export type TimeRange = '1h' | '24h' | '7d'

/**
 * Business Health Metrics (L1)
 */
export interface BusinessHealthMetrics {
  total_requests: number
  lawcore_adoption_rate: number // percentage 0-100
  health_score: number // 0-100
  daily_cost: number
  hourly_traffic: Array<{
    hour: string
    requests: number
  }>
  timestamp: string
}

/**
 * Application Performance Metrics (L2)
 */
export interface EndpointMetrics {
  endpoint: string
  method: string
  request_count: number
  avg_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  error_count: number
  error_rate: number // percentage
}

export interface AppPerformanceMetrics {
  sla_status: {
    p95_threshold_ms: number
    p95_current_ms: number
    is_compliant: boolean
  }
  endpoints: EndpointMetrics[]
  slowest_endpoints: EndpointMetrics[]
  error_distribution: Array<{
    status_code: number
    count: number
    category: string
  }>
  timestamp: string
}

/**
 * Infrastructure Metrics (L3)
 */
export interface InfraMetrics {
  db_stats: {
    size_mb: number
    connections_active: number
    connections_max: number
    cache_hit_ratio: number // percentage
  }
  slow_queries: Array<{
    query: string
    avg_time_ms: number
    calls: number
    total_time_ms: number
  }>
  table_bloat: Array<{
    table_name: string
    bloat_ratio: number
    waste_mb: number
  }>
  unused_indexes: Array<{
    index_name: string
    table_name: string
    size_mb: number
  }>
  timestamp: string
}

/**
 * Deep Health Check
 */
export interface DeepHealthCheck {
  name: string
  status: 'ok' | 'degraded' | 'fail' | 'skip'
  detail: string
}

export interface DeepHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  duration_ms: number
  checks: DeepHealthCheck[]
  summary: {
    total: number
    ok: number
    degraded: number
    fail: number
    skip: number
  }
}

/**
 * System Stats
 */
export interface SystemStatsResponse {
  timestamp: string
  uptime_seconds: number
  http: { total_requests: number; requests_in_progress: number }
  business: { total_products: number; total_ingredients: number; total_observations: number; total_variants: number }
  queue: { pending_jobs: number; total_jobs: number }
  cost: { daily_spent_usd: number; daily_limit_usd: number; monthly_spent_usd: number; monthly_limit_usd: number }
  errors: { total_errors: number; dlq_messages: number }
  cache: { hits: number; misses: number; hit_rate: number }
}

/**
 * Dashboard Data
 */
export interface DashboardDataResponse {
  timestamp: string
  uptime_seconds: number
  http: Record<string, unknown>
  business: Record<string, unknown>
  queue: Record<string, unknown>
  cost: Record<string, unknown>
  errors: Record<string, unknown>
  cache: Record<string, unknown>
  health_indicators: {
    http_success_rate: number // 0-100 percentage (already computed by backend)
    cache_hit_rate: number // 0-100 percentage (already computed by backend)
    budget_health: 'healthy' | 'warning' | 'critical'
    queue_health: 'healthy' | 'normal' | 'warning' | 'critical' | 'no_workers'
  }
  recent_activity: {
    products_created_last_hour: number
    ai_requests_last_hour: number
    errors_last_hour: number
  }
  alerts: {
    severity: 'warning' | 'critical'
    type: string
    message: string
    value: number
  }[]
}

/**
 * Error detail for drill-down
 */
export interface ErrorDetail {
  trace_id: string
  endpoint: string
  method: string
  status_code: number
  error_message: string
  timestamp: string
  user_id?: string
}

/**
 * Monitoring API Client
 *
 * Uses apiClient (V1 base = /api/v1) to match backend router prefix /api/v1/monitoring/*
 */
export class MonitoringAPI {
  /**
   * Get business health metrics (L1)
   * Composed from /stats + /dashboard-data since backend has no dedicated /business endpoint
   */
  async getBusinessHealth(_range: TimeRange = '24h'): Promise<BusinessHealthMetrics> {
    const [stats, dashboard] = await Promise.all([
      this.getSystemStats(),
      this.getDashboardData(),
    ])

    return {
      total_requests: stats.http.total_requests,
      lawcore_adoption_rate: 0, // TODO: compute from backend metrics when available
      health_score: this._computeHealthScore(dashboard),
      daily_cost: stats.cost.daily_spent_usd,
      hourly_traffic: [], // TODO: needs backend time-series endpoint
      timestamp: stats.timestamp,
    }
  }

  /**
   * Get application performance metrics (L2)
   * Composed from /stats + /dashboard-data since backend has no dedicated /app endpoint
   */
  async getAppPerformance(_range: TimeRange = '1h'): Promise<AppPerformanceMetrics> {
    const dashboard = await this.getDashboardData()

    return {
      sla_status: {
        p95_threshold_ms: 500, // default SLA threshold
        p95_current_ms: 0, // TODO: needs backend latency metrics endpoint
        is_compliant: dashboard.health_indicators.http_success_rate >= 99,
      },
      endpoints: [],
      slowest_endpoints: [],
      error_distribution: [],
      timestamp: dashboard.timestamp,
    }
  }

  /**
   * Get infrastructure metrics (L3)
   * Composed from /stats since backend has no dedicated /infra endpoint
   */
  async getInfraMetrics(_range: TimeRange = '1h'): Promise<InfraMetrics> {
    const stats = await this.getSystemStats()

    return {
      db_stats: {
        size_mb: 0, // TODO: needs backend DB stats endpoint
        connections_active: 0,
        connections_max: 100,
        cache_hit_ratio: stats.cache.hit_rate, // already 0-100 percentage
      },
      slow_queries: [],
      table_bloat: [],
      unused_indexes: [],
      timestamp: stats.timestamp,
    }
  }

  /**
   * Get error details for a specific endpoint
   */
  async getEndpointErrors(
    endpoint: string,
    limit: number = 20
  ): Promise<{ errors: ErrorDetail[] }> {
    const encodedEndpoint = encodeURIComponent(endpoint)
    return apiClient.get<{ errors: ErrorDetail[] }>(
      `/monitoring/errors?endpoint=${encodedEndpoint}&limit=${limit}`
    )
  }

  /**
   * Get deep health check (Tier 2 — admin JWT required)
   */
  async getDeepHealth(): Promise<DeepHealthResponse> {
    return apiClient.get<DeepHealthResponse>('/monitoring/health/deep')
  }

  /**
   * Get system stats (Tier 2 — admin JWT required)
   */
  async getSystemStats(): Promise<SystemStatsResponse> {
    return apiClient.get<SystemStatsResponse>('/monitoring/stats')
  }

  /**
   * Get dashboard data (Tier 2 — admin JWT required)
   */
  async getDashboardData(): Promise<DashboardDataResponse> {
    return apiClient.get<DashboardDataResponse>('/monitoring/dashboard-data')
  }

  /**
   * Trigger manual metrics collection (Tier 2 — admin JWT required)
   */
  async collectMetrics(): Promise<{ status: string; timestamp: string; message: string }> {
    return apiClient.post('/monitoring/collect', {})
  }

  /**
   * Generate incident copy template
   */
  generateIncidentTemplate(metrics: AppPerformanceMetrics): string {
    const { sla_status, slowest_endpoints, error_distribution } = metrics

    const template = `
## Incident Report

**Time**: ${new Date().toISOString()}

**SLA Status**:
- P95 Threshold: ${sla_status.p95_threshold_ms}ms
- P95 Current: ${sla_status.p95_current_ms}ms
- Compliant: ${sla_status.is_compliant ? 'YES' : 'NO'}

**Slowest Endpoints**:
${slowest_endpoints
  .slice(0, 5)
  .map(
    (ep) =>
      `- ${ep.method} ${ep.endpoint}: ${ep.p95_latency_ms}ms (${ep.request_count} requests, ${ep.error_rate.toFixed(2)}% errors)`
  )
  .join('\n')}

**Error Distribution**:
${error_distribution
  .slice(0, 5)
  .map((err) => `- ${err.status_code} (${err.category}): ${err.count} errors`)
  .join('\n')}

**Next Steps**:
1. Check slow query logs
2. Review error traces
3. Investigate resource usage
    `.trim()

    return template
  }

  /** Compute a 0-100 health score from dashboard indicators */
  private _computeHealthScore(dashboard: DashboardDataResponse): number {
    const { health_indicators } = dashboard
    let score = 100

    // Deduct for low HTTP success rate
    if (health_indicators.http_success_rate < 99) score -= 30
    else if (health_indicators.http_success_rate < 99.9) score -= 10

    // Deduct for low cache hit rate
    if (health_indicators.cache_hit_rate < 80) score -= 20
    else if (health_indicators.cache_hit_rate < 90) score -= 10

    // Deduct for budget issues
    if (health_indicators.budget_health === 'critical') score -= 20
    else if (health_indicators.budget_health === 'warning') score -= 10

    // Deduct for queue issues
    if (health_indicators.queue_health === 'critical' || health_indicators.queue_health === 'no_workers') score -= 20
    else if (health_indicators.queue_health === 'warning') score -= 10

    return Math.max(0, score)
  }
}

export const monitoringAPI = new MonitoringAPI()
