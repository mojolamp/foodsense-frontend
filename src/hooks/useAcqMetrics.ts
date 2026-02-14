import { useQuery } from '@tanstack/react-query'
import { acquisitionMetricsAPI } from '@/lib/api/endpoints/dlq'

export function useAcquisitionMetrics() {
  return useQuery({
    queryKey: ['acquisition-metrics'],
    queryFn: () => acquisitionMetricsAPI.getMetrics(),
    refetchInterval: 30_000,
  })
}
