import { apiClient } from '../client'
import type {
  Rule,
  RuleCreate,
  RuleUpdate,
  RuleTestRequest,
  RuleTestResult,
} from '@/types/rule'

export interface RulesResponse {
  rules: Rule[]
  total: number
}

export const rulesAPI = {
  getRules: async (params?: {
    is_active?: boolean
    sort_by?: 'hit_count' | 'created_at'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) => {
    const query = new URLSearchParams({
      ...(params?.is_active !== undefined && { is_active: String(params.is_active) }),
      sort_by: params?.sort_by || 'hit_count',
      order: params?.order || 'desc',
      limit: String(params?.limit || 50),
      offset: String(params?.offset || 0),
    })

    return apiClient.get<RulesResponse>(`/admin/rules?${query}`)
  },

  getRule: async (ruleId: string) => {
    return apiClient.get<Rule>(`/admin/rules/${ruleId}`)
  },

  createRule: async (data: RuleCreate) => {
    return apiClient.post<Rule>('/admin/rules', data)
  },

  updateRule: async (ruleId: string, data: RuleUpdate) => {
    return apiClient.put<Rule>(`/admin/rules/${ruleId}`, data)
  },

  deleteRule: async (ruleId: string) => {
    return apiClient.delete(`/admin/rules/${ruleId}`)
  },

  toggleRule: async (ruleId: string) => {
    return apiClient.post<Rule>(`/admin/rules/${ruleId}/toggle`, {})
  },

  testRule: async (data: RuleTestRequest) => {
    return apiClient.post<RuleTestResult>('/admin/rules/test', data)
  },
}


