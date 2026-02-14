import { apiClient } from '../client'
import type {
  DLQStats,
  DLQMessagesResponse,
  DLQActionResponse,
  DedupStats,
  AcquisitionMetrics,
} from '@/types/dlq'

export const dlqAPI = {
  async getStats(): Promise<{ success: boolean; stats: DLQStats }> {
    return apiClient.get('/api/v1/dlq/stats')
  },

  async getMessages(params?: {
    queue_type?: string
    status?: string
    page?: number
    page_size?: number
  }): Promise<DLQMessagesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.queue_type) searchParams.set('queue_type', params.queue_type)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.page_size) searchParams.set('page_size', String(params.page_size))
    const qs = searchParams.toString()
    return apiClient.get<DLQMessagesResponse>(`/api/v1/dlq/messages${qs ? `?${qs}` : ''}`)
  },

  async replayMessage(messageId: string): Promise<DLQActionResponse> {
    return apiClient.post<DLQActionResponse>(`/api/v1/dlq/replay/${messageId}`, {})
  },

  async replayQueue(queueType?: string): Promise<{ success: boolean; replayed_count: number }> {
    return apiClient.post('/api/v1/dlq/replay-queue', { queue_type: queueType })
  },

  async archiveMessage(messageId: string): Promise<DLQActionResponse> {
    return apiClient.post<DLQActionResponse>(`/api/v1/dlq/archive/${messageId}`, {})
  },

  async deleteMessage(messageId: string): Promise<DLQActionResponse> {
    return apiClient.delete<DLQActionResponse>(`/api/v1/dlq/messages/${messageId}`)
  },
}

export const dedupAPI = {
  async getStats(): Promise<{ success: boolean; stats: DedupStats }> {
    return apiClient.get('/api/v1/dedup/stats')
  },
}

export const acquisitionMetricsAPI = {
  async getMetrics(): Promise<{ success: boolean; metrics: AcquisitionMetrics }> {
    return apiClient.get('/api/v1/data-acquisition/metrics')
  },
}
