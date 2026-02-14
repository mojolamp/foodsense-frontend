import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dlqAPI, dedupAPI } from '@/lib/api/endpoints/dlq'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'

export function useDLQStats() {
  return useQuery({
    queryKey: ['dlq-stats'],
    queryFn: () => dlqAPI.getStats(),
    refetchInterval: 30_000,
  })
}

export function useDLQMessages(params?: {
  queue_type?: string
  status?: string
  page?: number
  page_size?: number
}) {
  return useQuery({
    queryKey: ['dlq-messages', params],
    queryFn: () => dlqAPI.getMessages(params),
  })
}

export function useReplayMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => dlqAPI.replayMessage(messageId),
    onSuccess: () => {
      toast.success('Message replayed')
      queryClient.invalidateQueries({ queryKey: ['dlq-messages'] })
      queryClient.invalidateQueries({ queryKey: ['dlq-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Replay failed')
    },
  })
}

export function useReplayQueue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (queueType?: string) => dlqAPI.replayQueue(queueType),
    onSuccess: (data) => {
      toast.success(`Replayed ${data.replayed_count} messages`)
      queryClient.invalidateQueries({ queryKey: ['dlq-messages'] })
      queryClient.invalidateQueries({ queryKey: ['dlq-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Queue replay failed')
    },
  })
}

export function useArchiveMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => dlqAPI.archiveMessage(messageId),
    onSuccess: () => {
      toast.success('Message archived')
      queryClient.invalidateQueries({ queryKey: ['dlq-messages'] })
      queryClient.invalidateQueries({ queryKey: ['dlq-stats'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Archive failed')
    },
  })
}

export function useDedupStats() {
  return useQuery({
    queryKey: ['dedup-stats'],
    queryFn: () => dedupAPI.getStats(),
    refetchInterval: 30_000,
  })
}
