import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingestionGateAPI } from '@/lib/api/endpoints/ingestionGate'
import toast from 'react-hot-toast'

export function useReviewQueue(filters?: {
  status?: string
  priority?: number
  decision?: 'BLOCK' | 'WARN_ALLOW' | 'PASS'
}) {
  return useQuery({
    queryKey: ['ingestionGateReviewQueue', filters],
    queryFn: () => ingestionGateAPI.getReviewQueue(filters),
  })
}

export function useReviewDetail(reviewId: string) {
  return useQuery({
    queryKey: ['ingestionGateReviewDetail', reviewId],
    queryFn: () => ingestionGateAPI.getReviewDetail(reviewId),
    enabled: !!reviewId,
  })
}

export function useResolveReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, resolution }: { reviewId: string; resolution: { status: string; notes?: string } }) =>
      ingestionGateAPI.resolveReview(reviewId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      toast.success('審核已標記為已解決')
    },
    onError: (error: any) => {
      toast.error(error.message || '標記失敗')
    },
  })
}

export function useApplyPatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, findingId, patch }: { reviewId: string; findingId: string; patch: any[] }) =>
      ingestionGateAPI.applyPatch(reviewId, { finding_id: findingId, patch }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewDetail'] })
      toast.success('修正已套用')
    },
    onError: (error: any) => {
      toast.error(error.message || '套用失敗')
    },
  })
}

export function useEntitySuggest(query: string, namespace: 'ingredients' | 'allergens' | 'additives') {
  return useQuery({
    queryKey: ['entitySuggest', query, namespace],
    queryFn: () => ingestionGateAPI.getEntitySuggest(query, namespace),
    enabled: query.length > 0,
  })
}

export function useCommitEntityAlias() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { original: string; canonical: string; namespace: string }) =>
      ingestionGateAPI.commitEntityAlias(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitySuggest'] })
      toast.success('別名已提交')
    },
    onError: (error: any) => {
      toast.error(error.message || '提交失敗')
    },
  })
}

export function useRetryGate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ scanId, action, targetFields }: { scanId: string; action: string; targetFields: string[] }) =>
      ingestionGateAPI.retryGate(scanId, { action, target_fields: targetFields }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      toast.success('重掃已啟動')
    },
    onError: (error: any) => {
      toast.error(error.message || '重掃失敗')
    },
  })
}

export function useBulkResolve() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewIds, status }: { reviewIds: string[]; status: string }) =>
      ingestionGateAPI.bulkResolve(reviewIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      toast.success('批次標記成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '批次操作失敗')
    },
  })
}

export function useBulkApplyFix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewIds, ruleId, patch }: { reviewIds: string[]; ruleId: string; patch: any[] }) =>
      ingestionGateAPI.bulkApplyFix(reviewIds, { rule_id: ruleId, patch }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      toast.success('批次套用成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '批次套用失敗')
    },
  })
}

