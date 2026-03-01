import { apiClient } from '../client'
import type {
  BudgetStatusResponse,
  DailySummaryResponse,
  TenantCostBreakdown,
  ModelCostBreakdown,
  CostAlert,
  TrackCostRequest,
  TrackCostResponse,
  CostHealthResponse,
} from '@/types/costMonitoring'

export const costMonitoringAPI = {
  async getBudgetStatus(): Promise<BudgetStatusResponse> {
    return apiClient.get('/cost/budget-status')
  },

  async getDailySummary(params?: {
    date?: string
    tenant_id?: string
  }): Promise<DailySummaryResponse> {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set('date', params.date)
    if (params?.tenant_id) searchParams.set('tenant_id', params.tenant_id)
    const qs = searchParams.toString()
    return apiClient.get(`/cost/daily-summary${qs ? `?${qs}` : ''}`)
  },

  async getByTenant(params: {
    start_date: string
    end_date?: string
  }): Promise<TenantCostBreakdown[]> {
    const searchParams = new URLSearchParams()
    searchParams.set('start_date', params.start_date)
    if (params.end_date) searchParams.set('end_date', params.end_date)
    return apiClient.get(`/cost/by-tenant?${searchParams.toString()}`)
  },

  async getByModel(params: {
    start_date: string
    end_date?: string
  }): Promise<ModelCostBreakdown[]> {
    const searchParams = new URLSearchParams()
    searchParams.set('start_date', params.start_date)
    if (params.end_date) searchParams.set('end_date', params.end_date)
    return apiClient.get(`/cost/by-model?${searchParams.toString()}`)
  },

  async getAlerts(): Promise<CostAlert[]> {
    return apiClient.get('/cost/alerts')
  },

  async trackCost(req: TrackCostRequest): Promise<TrackCostResponse> {
    return apiClient.post('/cost/track', req)
  },

  async getHealth(): Promise<CostHealthResponse> {
    return apiClient.get('/cost/health')
  },
}
