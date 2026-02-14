import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskQueueAPI } from '@/lib/api/endpoints/taskQueue'
import { getErrorMessage } from '@/types/api'
import type {
  AggregationBatchRequest,
  EmbeddingsGenerateRequest,
  ExportProductsRequest,
  SendEmailRequest,
} from '@/types/taskQueue'

export function useTaskQueueHealth() {
  return useQuery({
    queryKey: ['taskQueue', 'health'],
    queryFn: () => taskQueueAPI.getHealth(),
    refetchInterval: 30_000,
  })
}

export function useTaskQueueStats() {
  return useQuery({
    queryKey: ['taskQueue', 'stats'],
    queryFn: () => taskQueueAPI.getStats(),
    refetchInterval: 10_000,
  })
}

export function useTaskJobStatus(jobId: string) {
  return useQuery({
    queryKey: ['taskQueue', 'job', jobId],
    queryFn: () => taskQueueAPI.getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: 5_000,
  })
}

export function useTaskCancelJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => taskQueueAPI.cancelJob(jobId),
    onSuccess: (_, jobId) => {
      toast.success(`Job ${jobId} cancelled`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTaskRetryJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => taskQueueAPI.retryJob(jobId),
    onSuccess: (data) => {
      toast.success(`Job retried → ${data.new_job_id}`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTriggerAggregation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => taskQueueAPI.triggerAggregation(productId),
    onSuccess: (data) => {
      toast.success(`Aggregation enqueued: ${data.job_id}`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTriggerAggregationBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AggregationBatchRequest) => taskQueueAPI.triggerAggregationBatch(data),
    onSuccess: (data) => {
      toast.success(`Batch aggregation enqueued: ${data.product_count} products`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTriggerEmbeddings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmbeddingsGenerateRequest) => taskQueueAPI.triggerEmbeddings(data),
    onSuccess: (data) => {
      toast.success(`Embeddings enqueued: ${data.item_count} items`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTriggerExport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ExportProductsRequest) => taskQueueAPI.triggerExport(data),
    onSuccess: (data) => {
      toast.success(`Export enqueued: ${data.job_id}`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useSendEmail() {
  return useMutation({
    mutationFn: (data: SendEmailRequest) => taskQueueAPI.sendEmail(data),
    onSuccess: (data) => {
      toast.success(`Email enqueued to ${data.to}`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTriggerCleanupLogs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (days?: number) => taskQueueAPI.triggerCleanupLogs(days),
    onSuccess: () => {
      toast.success('Log cleanup enqueued')
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTriggerDailyMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => taskQueueAPI.triggerDailyMaintenance(),
    onSuccess: () => {
      toast.success('Daily maintenance enqueued')
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useClearQueue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (queueName: string) => taskQueueAPI.clearQueue(queueName),
    onSuccess: (data) => {
      toast.success(`Queue "${data.queue}" cleared`)
      qc.invalidateQueries({ queryKey: ['taskQueue'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
