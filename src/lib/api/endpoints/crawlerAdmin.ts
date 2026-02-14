import { apiClient } from '../client'
import type {
  DOMRepairStats,
  RepairActionResponse,
  RepairsPendingResponse,
} from '@/types/crawlerAdmin'

export const crawlerAdminAPI = {
  async getStats(): Promise<{ success: boolean; stats: DOMRepairStats }> {
    return apiClient.get('/api/v1/crawler-admin/repairs/stats')
  },

  async getPendingRepairs(params?: {
    page?: number
    page_size?: number
  }): Promise<RepairsPendingResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.page_size) searchParams.set('page_size', String(params.page_size))
    const qs = searchParams.toString()
    return apiClient.get<RepairsPendingResponse>(
      `/api/v1/crawler-admin/repairs/pending${qs ? `?${qs}` : ''}`
    )
  },

  async approveRepair(repairId: string): Promise<RepairActionResponse> {
    return apiClient.post<RepairActionResponse>(
      `/api/v1/crawler-admin/repairs/${repairId}/approve`,
      {}
    )
  },

  async rejectRepair(
    repairId: string,
    reason: string
  ): Promise<RepairActionResponse> {
    return apiClient.post<RepairActionResponse>(
      `/api/v1/crawler-admin/repairs/${repairId}/reject`,
      { reason }
    )
  },
}
