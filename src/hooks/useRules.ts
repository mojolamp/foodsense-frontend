import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rulesAPI } from '@/lib/api/endpoints/rules'
import type { RuleCreate, RuleUpdate } from '@/types/rule'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/types/api'

export function useRules(params?: {
  is_active?: boolean
  sort_by?: 'hit_count' | 'created_at'
}) {
  return useQuery({
    queryKey: ['rules', params],
    queryFn: () => rulesAPI.getRules(params),
  })
}

export function useRule(ruleId: string) {
  return useQuery({
    queryKey: ['rule', ruleId],
    queryFn: () => rulesAPI.getRule(ruleId),
    enabled: !!ruleId,
  })
}

export function useCreateRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RuleCreate) => rulesAPI.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] })
      toast.success('規則已建立!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '建立失敗')
    },
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: RuleUpdate }) =>
      rulesAPI.updateRule(ruleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules'] })
      queryClient.invalidateQueries({ queryKey: ['rule', variables.ruleId] })
      toast.success('規則已更新!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '更新失敗')
    },
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: string) => rulesAPI.deleteRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] })
      toast.success('規則已刪除!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '刪除失敗')
    },
  })
}

export function useToggleRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: string) => rulesAPI.toggleRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] })
      toast.success('規則狀態已更新!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '更新失敗')
    },
  })
}


