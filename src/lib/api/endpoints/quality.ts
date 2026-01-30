import { apiClient } from '../client'
import type {
  QualityOverview,
  CoverageStats,
  SourceContribution,
  TimelineData,
} from '@/types/quality'

export const qualityAPI = {
  getOverview: async () => {
    return apiClient.get<QualityOverview>('/admin/quality/overview')
  },

  getCoverage: async () => {
    return apiClient.get<CoverageStats[]>('/admin/quality/coverage')
  },

  getSourceContribution: async () => {
    return apiClient.get<SourceContribution[]>('/admin/quality/sources')
  },

  getTimeline: async (days: number = 30) => {
    return apiClient.get<TimelineData[]>(`/admin/quality/timeline?days=${days}`)
  },
}





