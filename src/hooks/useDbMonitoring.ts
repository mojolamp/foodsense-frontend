import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbMonitoringAPI } from '@/lib/api/endpoints/dbMonitoring'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'

export function useDbStats() {
  return useQuery({
    queryKey: ['db-stats'],
    queryFn: () => dbMonitoringAPI.getStats(),
    refetchInterval: 30_000,
  })
}

export function useSlowQueries(params?: { threshold_ms?: number; limit?: number }) {
  return useQuery({
    queryKey: ['db-slow-queries', params],
    queryFn: () => dbMonitoringAPI.getSlowQueries(params),
  })
}

export function useOptimizationReport() {
  return useQuery({
    queryKey: ['db-optimization-report'],
    queryFn: () => dbMonitoringAPI.getOptimizationReport(),
  })
}

export function useDbAnalyze() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => dbMonitoringAPI.analyze(),
    onSuccess: () => {
      toast.success('Database ANALYZE completed')
      queryClient.invalidateQueries({ queryKey: ['db-stats'] })
      queryClient.invalidateQueries({ queryKey: ['db-slow-queries'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'ANALYZE failed')
    },
  })
}

export function useIndexUsage(table?: string) {
  return useQuery({
    queryKey: ['db-index-usage', table],
    queryFn: () => dbMonitoringAPI.getIndexUsage(table),
  })
}

export function useConnectionPool() {
  return useQuery({
    queryKey: ['db-connection-pool'],
    queryFn: () => dbMonitoringAPI.getConnectionPool(),
    refetchInterval: 15_000,
  })
}

export function useResetMonitoring() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => dbMonitoringAPI.resetMonitoring(),
    onSuccess: () => {
      toast.success('Monitoring data reset')
      queryClient.invalidateQueries({ queryKey: ['db-stats'] })
      queryClient.invalidateQueries({ queryKey: ['db-slow-queries'] })
      queryClient.invalidateQueries({ queryKey: ['db-optimization-report'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Reset failed')
    },
  })
}

export function useDbHealth() {
  return useQuery({
    queryKey: ['db-health'],
    queryFn: () => dbMonitoringAPI.getHealth(),
    refetchInterval: 30_000,
  })
}
