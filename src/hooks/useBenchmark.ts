import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { benchmarkAPI } from '@/lib/api/endpoints/benchmark'
import { getErrorMessage } from '@/types/api'

export function useBenchmarkRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => benchmarkAPI.run(),
    onSuccess: () => {
      toast.success('Benchmark completed')
      qc.invalidateQueries({ queryKey: ['benchmark'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useBenchmarkResults() {
  return useQuery({
    queryKey: ['benchmark', 'results'],
    queryFn: () => benchmarkAPI.getResults(),
  })
}

export function useBenchmarkHistory(limit = 10) {
  return useQuery({
    queryKey: ['benchmark', 'history', limit],
    queryFn: () => benchmarkAPI.getHistory(limit),
  })
}

export function useBenchmarkMetrics() {
  return useQuery({
    queryKey: ['benchmark', 'metrics'],
    queryFn: () => benchmarkAPI.getMetrics(),
  })
}

export function useDatasetInfo() {
  return useQuery({
    queryKey: ['benchmark', 'dataset-info'],
    queryFn: () => benchmarkAPI.getDatasetInfo(),
  })
}
