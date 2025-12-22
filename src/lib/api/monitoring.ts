/**
 * Monitoring API Client
 *
 * Three-layer defense monitoring system
 * - L1: Business Health
 * - L2: Application Performance
 * - L3: Infrastructure
 *
 * Contract: 2025-12-22
 */

import { apiClientV2 } from './client'

export type TimeRange = '1h' | '24h' | '7d'

/**
 * Business Health Metrics (L1)
 */
export interface BusinessHealthMetrics {
  total_requests: number
  lawcore_adoption_rate: number // percentage
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
 */
export class MonitoringAPI {
  /**
   * Get business health metrics (L1)
   */
  async getBusinessHealth(range: TimeRange = '24h'): Promise<BusinessHealthMetrics> {
    return apiClientV2.get<BusinessHealthMetrics>(`/monitoring/business?range=${range}`)
  }

  /**
   * Get application performance metrics (L2)
   */
  async getAppPerformance(range: TimeRange = '1h'): Promise<AppPerformanceMetrics> {
    return apiClientV2.get<AppPerformanceMetrics>(`/monitoring/app?range=${range}`)
  }

  /**
   * Get infrastructure metrics (L3)
   */
  async getInfraMetrics(range: TimeRange = '1h'): Promise<InfraMetrics> {
    return apiClientV2.get<InfraMetrics>(`/monitoring/infra?range=${range}`)
  }

  /**
   * Get error details for a specific endpoint
   */
  async getEndpointErrors(
    endpoint: string,
    limit: number = 20
  ): Promise<{ errors: ErrorDetail[] }> {
    const encodedEndpoint = encodeURIComponent(endpoint)
    return apiClientV2.get<{ errors: ErrorDetail[] }>(
      `/monitoring/errors?endpoint=${encodedEndpoint}&limit=${limit}`
    )
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
- Compliant: ${sla_status.is_compliant ? '✅' : '❌'}

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
}

export const monitoringAPI = new MonitoringAPI()
