import { useQuery } from '@tanstack/react-query'
import { dataQualityV2API } from '@/lib/api/endpoints/dataQualityV2'

export function useDQCoverage() {
  return useQuery({
    queryKey: ['data-quality', 'coverage'],
    queryFn: () => dataQualityV2API.getCoverage(),
    refetchInterval: 60_000,
  })
}

export function useDQDrift() {
  return useQuery({
    queryKey: ['data-quality', 'drift'],
    queryFn: () => dataQualityV2API.getDrift(),
    refetchInterval: 60_000,
  })
}

export function useDQFreshness() {
  return useQuery({
    queryKey: ['data-quality', 'freshness'],
    queryFn: () => dataQualityV2API.getFreshness(),
    refetchInterval: 60_000,
  })
}

export function useDQValidationErrors(limit = 50) {
  return useQuery({
    queryKey: ['data-quality', 'validation-errors', limit],
    queryFn: () => dataQualityV2API.getValidationErrors(limit),
    refetchInterval: 60_000,
  })
}

export function useDQIngestionSummary() {
  return useQuery({
    queryKey: ['data-quality', 'ingestion-summary'],
    queryFn: () => dataQualityV2API.getIngestionSummary(),
    refetchInterval: 60_000,
  })
}
