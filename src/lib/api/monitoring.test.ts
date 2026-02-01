/**
 * Monitoring API Tests
 *
 * @module lib/api/monitoring.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MonitoringAPI, monitoringAPI } from './monitoring'
import { apiClientV2 } from './client'

// Mock apiClientV2
vi.mock('./client', () => ({
  apiClientV2: {
    get: vi.fn(),
  },
}))

describe('MonitoringAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBusinessHealth', () => {
    it('should call API with default range', async () => {
      const mockResponse = {
        total_requests: 1000,
        lawcore_adoption_rate: 85.5,
        health_score: 95,
        daily_cost: 150.0,
        hourly_traffic: [{ hour: '10:00', requests: 100 }],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      const result = await monitoringAPI.getBusinessHealth()

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/business?range=24h')
      expect(result).toEqual(mockResponse)
    })

    it('should call API with custom range', async () => {
      const mockResponse = {
        total_requests: 500,
        lawcore_adoption_rate: 80,
        health_score: 90,
        daily_cost: 75.0,
        hourly_traffic: [],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      await monitoringAPI.getBusinessHealth('1h')

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/business?range=1h')
    })

    it('should handle 7d range', async () => {
      const mockResponse = {
        total_requests: 7000,
        lawcore_adoption_rate: 82,
        health_score: 88,
        daily_cost: 1050.0,
        hourly_traffic: [],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      await monitoringAPI.getBusinessHealth('7d')

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/business?range=7d')
    })
  })

  describe('getAppPerformance', () => {
    it('should call API with default range', async () => {
      const mockResponse = {
        sla_status: {
          p95_threshold_ms: 500,
          p95_current_ms: 350,
          is_compliant: true,
        },
        endpoints: [],
        slowest_endpoints: [],
        error_distribution: [],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      const result = await monitoringAPI.getAppPerformance()

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/app?range=1h')
      expect(result).toEqual(mockResponse)
    })

    it('should call API with custom range', async () => {
      const mockResponse = {
        sla_status: {
          p95_threshold_ms: 500,
          p95_current_ms: 400,
          is_compliant: true,
        },
        endpoints: [],
        slowest_endpoints: [],
        error_distribution: [],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      await monitoringAPI.getAppPerformance('24h')

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/app?range=24h')
    })
  })

  describe('getInfraMetrics', () => {
    it('should call API with default range', async () => {
      const mockResponse = {
        db_stats: {
          size_mb: 1024,
          connections_active: 10,
          connections_max: 100,
          cache_hit_ratio: 99.5,
        },
        slow_queries: [],
        table_bloat: [],
        unused_indexes: [],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      const result = await monitoringAPI.getInfraMetrics()

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/infra?range=1h')
      expect(result).toEqual(mockResponse)
    })

    it('should call API with custom range', async () => {
      const mockResponse = {
        db_stats: {
          size_mb: 1024,
          connections_active: 15,
          connections_max: 100,
          cache_hit_ratio: 98.0,
        },
        slow_queries: [
          { query: 'SELECT * FROM large_table', avg_time_ms: 5000, calls: 10, total_time_ms: 50000 },
        ],
        table_bloat: [{ table_name: 'logs', bloat_ratio: 0.3, waste_mb: 100 }],
        unused_indexes: [{ index_name: 'idx_old', table_name: 'legacy', size_mb: 50 }],
        timestamp: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      await monitoringAPI.getInfraMetrics('7d')

      expect(apiClientV2.get).toHaveBeenCalledWith('/monitoring/infra?range=7d')
    })
  })

  describe('getEndpointErrors', () => {
    it('should call API with encoded endpoint and default limit', async () => {
      const mockResponse = {
        errors: [
          {
            trace_id: 'trace-001',
            endpoint: '/api/v1/products',
            method: 'GET',
            status_code: 500,
            error_message: 'Internal server error',
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
      }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      const result = await monitoringAPI.getEndpointErrors('/api/v1/products')

      expect(apiClientV2.get).toHaveBeenCalledWith(
        '/monitoring/errors?endpoint=%2Fapi%2Fv1%2Fproducts&limit=20'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should call API with custom limit', async () => {
      const mockResponse = { errors: [] }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      await monitoringAPI.getEndpointErrors('/api/v1/scan', 50)

      expect(apiClientV2.get).toHaveBeenCalledWith(
        '/monitoring/errors?endpoint=%2Fapi%2Fv1%2Fscan&limit=50'
      )
    })

    it('should handle endpoint with special characters', async () => {
      const mockResponse = { errors: [] }
      vi.mocked(apiClientV2.get).mockResolvedValue(mockResponse)

      await monitoringAPI.getEndpointErrors('/api/v1/products?status=active&tier=A')

      expect(apiClientV2.get).toHaveBeenCalledWith(
        expect.stringContaining('/monitoring/errors?endpoint=')
      )
    })
  })

  describe('generateIncidentTemplate', () => {
    it('should generate template with all sections', () => {
      const metrics = {
        sla_status: {
          p95_threshold_ms: 500,
          p95_current_ms: 750,
          is_compliant: false,
        },
        endpoints: [],
        slowest_endpoints: [
          {
            endpoint: '/api/v1/scan',
            method: 'POST',
            request_count: 1000,
            avg_latency_ms: 500,
            p95_latency_ms: 800,
            p99_latency_ms: 1200,
            error_count: 50,
            error_rate: 5.0,
          },
          {
            endpoint: '/api/v1/products',
            method: 'GET',
            request_count: 5000,
            avg_latency_ms: 200,
            p95_latency_ms: 400,
            p99_latency_ms: 600,
            error_count: 10,
            error_rate: 0.2,
          },
        ],
        error_distribution: [
          { status_code: 500, count: 45, category: 'server_error' },
          { status_code: 400, count: 15, category: 'client_error' },
        ],
        timestamp: '2024-01-01T00:00:00Z',
      }

      const template = monitoringAPI.generateIncidentTemplate(metrics)

      expect(template).toContain('## Incident Report')
      expect(template).toContain('**SLA Status**')
      expect(template).toContain('P95 Threshold: 500ms')
      expect(template).toContain('P95 Current: 750ms')
      expect(template).toContain('Compliant: ❌')
      expect(template).toContain('**Slowest Endpoints**')
      expect(template).toContain('/api/v1/scan')
      expect(template).toContain('800ms')
      expect(template).toContain('**Error Distribution**')
      expect(template).toContain('500 (server_error): 45 errors')
      expect(template).toContain('**Next Steps**')
    })

    it('should show compliant checkmark when SLA is met', () => {
      const metrics = {
        sla_status: {
          p95_threshold_ms: 500,
          p95_current_ms: 300,
          is_compliant: true,
        },
        endpoints: [],
        slowest_endpoints: [],
        error_distribution: [],
        timestamp: '2024-01-01T00:00:00Z',
      }

      const template = monitoringAPI.generateIncidentTemplate(metrics)

      expect(template).toContain('Compliant: ✅')
    })

    it('should handle empty slowest endpoints', () => {
      const metrics = {
        sla_status: {
          p95_threshold_ms: 500,
          p95_current_ms: 300,
          is_compliant: true,
        },
        endpoints: [],
        slowest_endpoints: [],
        error_distribution: [],
        timestamp: '2024-01-01T00:00:00Z',
      }

      const template = monitoringAPI.generateIncidentTemplate(metrics)

      expect(template).toContain('**Slowest Endpoints**')
      expect(template).toContain('**Error Distribution**')
    })

    it('should limit to top 5 slowest endpoints', () => {
      const endpoints = Array(10)
        .fill(null)
        .map((_, i) => ({
          endpoint: `/api/v1/endpoint${i}`,
          method: 'GET',
          request_count: 100,
          avg_latency_ms: 100 + i * 10,
          p95_latency_ms: 200 + i * 10,
          p99_latency_ms: 300 + i * 10,
          error_count: i,
          error_rate: i * 0.1,
        }))

      const metrics = {
        sla_status: {
          p95_threshold_ms: 500,
          p95_current_ms: 300,
          is_compliant: true,
        },
        endpoints: [],
        slowest_endpoints: endpoints,
        error_distribution: [],
        timestamp: '2024-01-01T00:00:00Z',
      }

      const template = monitoringAPI.generateIncidentTemplate(metrics)

      // Should only include first 5 endpoints
      expect(template).toContain('/api/v1/endpoint0')
      expect(template).toContain('/api/v1/endpoint4')
      expect(template).not.toContain('/api/v1/endpoint5')
    })
  })
})

describe('monitoringAPI singleton', () => {
  it('should be an instance of MonitoringAPI', () => {
    expect(monitoringAPI).toBeInstanceOf(MonitoringAPI)
  })
})
