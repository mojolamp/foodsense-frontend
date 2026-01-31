import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingestionGateAPI } from '@/lib/api/endpoints/ingestionGate'
import { getErrorMessage, type JsonValue } from '@/types/api'
import toast from 'react-hot-toast'

export function useReviewQueue(filters?: {
  status?: string
  priority?: number
  decision?: 'BLOCK' | 'WARN_ALLOW' | 'PASS'
  limit?: number
  offset?: number
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

/**
 * P1-2: 樂觀更新
 *
 * 操作時立即從列表移除，失敗時回滾
 */
export function useResolveReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, resolution }: { reviewId: string; resolution: { status: string; notes?: string } }) =>
      ingestionGateAPI.resolveReview(reviewId, resolution),

    // 樂觀更新：操作前立即更新 UI
    onMutate: async ({ reviewId }) => {
      // 取消進行中的查詢，避免覆蓋樂觀更新
      await queryClient.cancelQueries({ queryKey: ['ingestionGateReviewQueue'] })

      // 快照前一個狀態（用於回滾）
      const previousQueue = queryClient.getQueryData(['ingestionGateReviewQueue'])

      // 樂觀更新：立即從列表移除
      queryClient.setQueryData(
        ['ingestionGateReviewQueue'],
        (old: Array<{ id: string }> | undefined) =>
          old?.filter(item => item.id !== reviewId) || []
      )

      // 返回 context 用於回滾
      return { previousQueue }
    },

    // 錯誤時回滾
    onError: (err: unknown, variables, context) => {
      if (context?.previousQueue) {
        queryClient.setQueryData(['ingestionGateReviewQueue'], context.previousQueue)
      }
      toast.error(getErrorMessage(err) || '標記失敗')
    },

    // 無論成功失敗都重新驗證資料
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      // 同步更新統計數字
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })
    },

    onSuccess: () => {
      toast.success('審核已標記為已解決')
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '套用失敗')
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '提交失敗')
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '重掃失敗')
    },
  })
}

/**
 * 批次操作結果類型
 * 用於累積錯誤上下文
 */
export interface BulkOperationResult {
  success: boolean
  total: number
  succeeded: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

/**
 * P1-2: 批次樂觀更新 + 錯誤上下文累積
 *
 * 改進：
 * - 累積並回報個別項目的錯誤
 * - 部分成功時顯示詳細統計
 * - 失敗項目自動回滾到列表
 */
export function useBulkResolve() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewIds, status }: { reviewIds: string[]; status: string }) =>
      ingestionGateAPI.bulkResolve(reviewIds, status),

    // 樂觀更新：批次移除
    onMutate: async ({ reviewIds }) => {
      await queryClient.cancelQueries({ queryKey: ['ingestionGateReviewQueue'] })

      const previousQueue = queryClient.getQueryData(['ingestionGateReviewQueue'])

      // 批次移除選中的項目
      queryClient.setQueryData(
        ['ingestionGateReviewQueue'],
        (old: Array<{ id: string }> | undefined) =>
          old?.filter(item => !reviewIds.includes(item.id)) || []
      )

      return { previousQueue, reviewIds }
    },

    onError: (err: unknown, variables, context) => {
      // 完全失敗：回滾所有項目
      if (context?.previousQueue) {
        queryClient.setQueryData(['ingestionGateReviewQueue'], context.previousQueue)
      }
      toast.error(getErrorMessage(err) || '批次操作失敗')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })
    },

    onSuccess: (data, variables, context) => {
      const total = variables.reviewIds.length
      const resolved = data.resolved ?? total
      const failed = data.failed ?? 0

      if (failed === 0) {
        toast.success(`批次標記成功：${resolved} 筆已處理`)
      } else {
        // 部分成功：顯示詳細統計
        toast.success(`批次標記完成：成功 ${resolved} 筆，失敗 ${failed} 筆`, {
          duration: 5000,
        })

        // 若有錯誤詳情，記錄到 console 供除錯
        if (data.errors && data.errors.length > 0) {
          console.warn('[BulkResolve] 部分失敗:', data.errors)
        }
      }
    },
  })
}

/**
 * P1-2: 批次套用修正 + 錯誤上下文累積
 *
 * 改進：
 * - 累積並回報個別項目的錯誤
 * - 部分成功時顯示詳細統計
 */
export function useBulkApplyFix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewIds, ruleId, patch }: { reviewIds: string[]; ruleId: string; patch: JsonValue[] }) =>
      ingestionGateAPI.bulkApplyFix(reviewIds, { rule_id: ruleId, patch }),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ingestionGateReviewQueue'] })

      const total = variables.reviewIds.length
      const applied = data.applied ?? total
      const failed = data.failed ?? 0

      if (failed === 0) {
        toast.success(`批次套用成功：${applied} 筆已修正`)
      } else {
        // 部分成功：顯示詳細統計
        toast.success(`批次套用完成：成功 ${applied} 筆，失敗 ${failed} 筆`, {
          duration: 5000,
        })

        // 若有錯誤詳情，記錄到 console 供除錯
        if (data.errors && data.errors.length > 0) {
          console.warn('[BulkApplyFix] 部分失敗:', data.errors)
        }
      }
    },

    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '批次套用失敗')
    },
  })
}

