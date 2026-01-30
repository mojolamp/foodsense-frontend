import { useQuery } from '@tanstack/react-query'
import { qualityAPI } from '@/lib/api/endpoints/quality'

export function useQualityOverview() {
  return useQuery({
    queryKey: ['qualityOverview'],
    queryFn: () => qualityAPI.getOverview(),
  })
}

export function useQualityTimeline(days: number = 30) {
  return useQuery({
    queryKey: ['qualityTimeline', days],
    queryFn: () => qualityAPI.getTimeline(days),
  })
}

export function useQualitySources() {
  return useQuery({
    queryKey: ['qualitySourceContribution'],
    queryFn: () => qualityAPI.getSourceContribution(),
  })
}

export function useQualityCoverage() {
  return useQuery({
    queryKey: ['qualityCoverage'],
    queryFn: () => qualityAPI.getCoverage(),
  })
}





