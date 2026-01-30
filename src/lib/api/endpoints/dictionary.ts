import { apiClient } from '../client'
import type {
  TokenRanking,
  TokenDetail,
  CorrectionRequest,
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
    return apiClient.get<{
      total_tokens: number
      total_corrections: number
      avg_token_per_product: number
      top_errors: Array<{ token: string; count: number }>
    }>('/admin/dictionary/stats')
  },
}





