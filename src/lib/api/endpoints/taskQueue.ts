import { apiClient } from '../client'
import type {
  TaskQueueHealthResponse,
  TaskQueueStatsResponse,
  TaskJobStatus,
  TaskCancelResponse,
  TaskRetryResponse,
  TaskEnqueueResponse,
  TaskQueueClearResponse,
  AggregationBatchRequest,
  EmbeddingsGenerateRequest,
  ExportProductsRequest,
  SendEmailRequest,
} from '@/types/taskQueue'

export const taskQueueAPI = {
  getHealth() {
    return apiClient.get<TaskQueueHealthResponse>('/tasks/health')
  },

  getStats() {
    return apiClient.get<TaskQueueStatsResponse>('/tasks/stats')
  },

  getQueueStats(queueName: string) {
    return apiClient.get<TaskQueueStatsResponse>(`/tasks/stats/${queueName}`)
  },

  getJobStatus(jobId: string) {
    return apiClient.get<TaskJobStatus>(`/tasks/job/${jobId}`)
  },

  cancelJob(jobId: string) {
    return apiClient.post<TaskCancelResponse>(`/tasks/job/${jobId}/cancel`, {})
  },

  retryJob(jobId: string) {
    return apiClient.post<TaskRetryResponse>(`/tasks/job/${jobId}/retry`, {})
  },

  triggerAggregation(productId: string) {
    return apiClient.post<TaskEnqueueResponse>(`/tasks/aggregation/product?product_id=${encodeURIComponent(productId)}`, {})
  },

  triggerAggregationBatch(data: AggregationBatchRequest) {
    return apiClient.post<TaskEnqueueResponse>('/tasks/aggregation/batch', data)
  },

  triggerEmbeddings(data: EmbeddingsGenerateRequest) {
    return apiClient.post<TaskEnqueueResponse>('/tasks/embeddings/generate', data)
  },

  triggerExport(data: ExportProductsRequest) {
    return apiClient.post<TaskEnqueueResponse>('/tasks/export/products', data)
  },

  sendEmail(data: SendEmailRequest) {
    return apiClient.post<TaskEnqueueResponse>('/tasks/email/send', data)
  },

  triggerCleanupLogs(days = 30) {
    return apiClient.post<TaskEnqueueResponse>(`/tasks/maintenance/cleanup-logs?days=${days}`, {})
  },

  triggerDailyMaintenance() {
    return apiClient.post<TaskEnqueueResponse>('/tasks/maintenance/daily', {})
  },

  clearQueue(queueName: string) {
    return apiClient.delete<TaskQueueClearResponse>(`/tasks/queue/${queueName}`)
  },
}
