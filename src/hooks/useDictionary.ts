import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dictionaryAPI } from '@/lib/api/endpoints/dictionary'
import type { CorrectionRequest } from '@/types/dictionary'
import toast from 'react-hot-toast'

export function useTokenRankings(sortBy: 'occurrence' | 'products', search: string) {
  return useQuery({
    queryKey: ['tokenRankings', sortBy, search],
    queryFn: () => dictionaryAPI.getTokenRankings({
      sort_by: sortBy,
      limit: 100,
      search: search || undefined,
    }),
  })
}

export function useTokenDetail(token: string) {
  return useQuery({
    queryKey: ['tokenDetail', token],
    queryFn: () => dictionaryAPI.getTokenDetail(token),
    enabled: !!token,
  })
}

export function useCreateCorrection(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CorrectionRequest) => dictionaryAPI.createCorrection(data),
    onSuccess: () => {
      toast.success('校正規則已建立!')
      queryClient.invalidateQueries({ queryKey: ['tokenRankings'] })
      queryClient.invalidateQueries({ queryKey: ['tokenDetail', token] })
    },
    onError: (error: any) => {
      toast.error(error.message || '建立失敗')
    },
  })
}





