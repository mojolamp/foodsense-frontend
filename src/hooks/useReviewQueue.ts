import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewAPI } from '@/lib/api/endpoints/review'
import type { GroundTruthCreate, OCRRecord } from '@/types/review'
import type { BatchReviewTemplate } from '@/types/api'
import { getErrorMessage } from '@/types/api'
import toast from 'react-hot-toast'

export function useReviewQueue(filters?: {
  validation_status?: string
  confidence_level?: string
}) {
  return useQuery({
    queryKey: ['reviewQueue', filters],
    queryFn: () => reviewAPI.getQueue({ ...filters, limit: 50 }),
  })
}

export function useReviewSubmit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GroundTruthCreate) => reviewAPI.submitReview(data),
    onSuccess: () => {
      // Reload queue and stats
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })
      toast.success('審核提交成功!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '審核提交失敗')
    },
  })
}

export function useReviewStats() {
  return useQuery({
    queryKey: ['reviewStats'],
    queryFn: () => reviewAPI.getStats(),
    refetchInterval: 30000, // Every 30 seconds
  })
}

export function useReviewHistory(limit = 50) {
  return useQuery({
    queryKey: ['reviewHistory', limit],
    queryFn: () => reviewAPI.getHistory({ limit }),
  })
}

export function useGoldSamples(limit = 50) {
  return useQuery({
    queryKey: ['goldSamples', limit],
    queryFn: () => reviewAPI.getGoldSamples({ limit }),
  })
}

/**
 * 批次審核 Hook (P1-1 優化)
 *
 * 改用後端批次 API，從 N 個請求改為 1 個請求
 */
export function useBatchReviewSubmit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      records,
      template
    }: {
      records: OCRRecord[]
      template: BatchReviewTemplate
    }) => {
      // 組裝批次請求資料
      const reviews = records.map(record => ({
        ocr_record_id: record.id,
        product_id: record.product_id,
        corrected_payload: {
          verified: true,
          verified_at: new Date().toISOString(),
          ocr_raw_text: record.ocr_raw_text,
        },
      }))

      // 使用批次 API（單一請求）
      return reviewAPI.batchSubmitReviews({
        reviews,
        template: {
          data_quality_score: template.data_quality_score,
          confidence_score: template.confidence_score,
          review_notes: template.review_notes,
          is_gold: template.is_gold,
        }
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
      queryClient.invalidateQueries({ queryKey: ['reviewStats'] })

      if (data.failed === 0) {
        toast.success(`成功批次審核 ${data.submitted} 筆記錄！`)
      } else {
        toast.success(`批次審核完成：成功 ${data.submitted} 筆，失敗 ${data.failed} 筆`)
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || '批次審核失敗')
    },
  })
}
