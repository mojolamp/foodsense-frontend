import { useQuery, useMutation } from '@tanstack/react-query'
import { costMonitoringAPI } from '@/lib/api/endpoints/costMonitoring'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'
import type { TrackCostRequest } from '@/types/costMonitoring'

export function useBudgetStatus() {
  return useQuery({
    queryKey: ['cost-budget-status'],
    queryFn: () => costMonitoringAPI.getBudgetStatus(),
    refetchInterval: 30_000,
  })
}

export function useDailySummary(params?: { date?: string; tenant_id?: string }) {
  return useQuery({
    queryKey: ['cost-daily-summary', params],
    queryFn: () => costMonitoringAPI.getDailySummary(params),
  })
}

export function useCostByTenant(params: { start_date: string; end_date?: string }) {
  return useQuery({
    queryKey: ['cost-by-tenant', params],
    queryFn: () => costMonitoringAPI.getByTenant(params),
    enabled: !!params.start_date,
  })
}

export function useCostByModel(params: { start_date: string; end_date?: string }) {
  return useQuery({
    queryKey: ['cost-by-model', params],
    queryFn: () => costMonitoringAPI.getByModel(params),
    enabled: !!params.start_date,
  })
}

export function useCostAlerts() {
  return useQuery({
    queryKey: ['cost-alerts'],
    queryFn: () => costMonitoringAPI.getAlerts(),
    refetchInterval: 30_000,
  })
}

export function useTrackCost() {
  return useMutation({
    mutationFn: (req: TrackCostRequest) => costMonitoringAPI.trackCost(req),
    onSuccess: () => {
      toast.success('Cost tracked')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to track cost')
    },
  })
}

export function useCostHealth() {
  return useQuery({
    queryKey: ['cost-health'],
    queryFn: () => costMonitoringAPI.getHealth(),
    refetchInterval: 30_000,
  })
}
