import { apiClient } from '../client'
import type {
  TokenRanking,
  TokenDetail,
  CorrectionRequest,
  AdditivesListResponse,
  DictionaryStatsResponse,
} from '@/types/dictionary'

export const dictionaryAPI = {
  getTokenRankings: async (params?: {
    sort_by?: 'occurrence' | 'products'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
    search?: string
  }) => {
    const query = new URLSearchParams({
      sort_by: params?.sort_by || 'occurrence',
      order: params?.order || 'desc',
      limit: String(params?.limit || 50),
      offset: String(params?.offset || 0),
      ...(params?.search && { search: params.search }),
    })

    return apiClient.get<{
      tokens: TokenRanking[]
      total: number
    }>(`/admin/dictionary/tokens?${query}`)
  },

  getTokenDetail: async (token: string) => {
    return apiClient.get<TokenDetail>(
      `/admin/dictionary/tokens/${encodeURIComponent(token)}`
    )
  },

  createCorrection: async (data: CorrectionRequest) => {
    return apiClient.post('/admin/dictionary/corrections', data)
  },

  getStats: async () => {
    return apiClient.get<DictionaryStatsResponse>('/admin/dictionary/stats')
  },

  getAdditives: async (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    return apiClient.get<AdditivesListResponse>(`/admin/dictionary/additives${params}`)
  },

  getOverview: async () => {
    return apiClient.get<{ dictionaries: string[] }>('/admin/dictionary/')
  },
}





